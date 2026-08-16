import { Button } from '@xtunes/ui';
import { CircleCheck, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api, type Update } from '@xtunes/api';
import {
    CustomToast,
    CustomToastActions,
    CustomToastContent,
    CustomToastDescription,
    CustomToastHeader,
    CustomToastIcon,
    CustomToastTitle,
} from '@/components/custom-toast';

import { useNavigate } from 'react-router';
import { useReleaseNotesStore } from '@/stores/release-notes-store';

const useUpdater = () => {
    const navigate = useNavigate();
    const [appVersion, setAppVersion] = useState('');
    const [tauriVersion, setTauriVersion] = useState<string>("Unknown");

    useEffect(() => {
        api.app.getVersion().then((v) => setAppVersion(v));
        api.app.getTauriVersion().then((v) => setTauriVersion(v)).catch(() => {
            setTauriVersion("Unknown");
        });
    }, []);

    async function checkForUpdates(): Promise<Update | null> {
        try {
            const update = await api.app.checkForUpdates();
            return update;
        } catch (e) {
            console.error('Error checking for updates:', e);
            return null;
        }
    }

    async function promptUpdate(update: Update) {
        toast.custom(
            (t) => (
                <CustomToast type="info">
                    <CustomToastHeader>
                        <CustomToastIcon>
                            <Info className="size-4" />
                        </CustomToastIcon>
                        <CustomToastContent>
                            <CustomToastTitle>Nueva versión disponible: v{update.version}</CustomToastTitle>
                            <CustomToastDescription>
                                Hay mejoras y correcciones disponibles.
                            </CustomToastDescription>
                        </CustomToastContent>
                    </CustomToastHeader>
                    <CustomToastActions className="mt-4">
                        <Button
                            onClick={() => {
                                toast.dismiss(t);
                                useReleaseNotesStore.getState().setPendingNotes(update.body || '');
                                navigate("/release-notes");
                            }}
                            variant="outline"
                            size="sm"
                        >
                            Notas de la versión
                        </Button>
                        <Button
                            onClick={async () => {
                                toast.dismiss(t);
                                const installingToast = toast.loading('Descargando actualización...');
                                try {
                                    await update.downloadAndInstall((event) => {
                                        if (event.event === 'Started' && event.data.contentLength) {
                                            toast.loading('Descargando actualización...', {
                                                id: installingToast,
                                            });
                                        } else if (event.event === 'Finished') {
                                            toast.dismiss(installingToast);
                                            toast.custom(
                                                (t2) => (
                                                    <CustomToast type="success">
                                                        <CustomToastHeader>
                                                            <CustomToastIcon>
                                                                <CircleCheck className="size-4" />
                                                            </CustomToastIcon>
                                                            <CustomToastContent>
                                                                <CustomToastTitle>
                                                                    Actualización lista
                                                                </CustomToastTitle>
                                                                <CustomToastDescription>
                                                                    La nueva versión se aplicará al reiniciar.
                                                                </CustomToastDescription>
                                                            </CustomToastContent>
                                                        </CustomToastHeader>
                                                        <CustomToastActions>
                                                            <Button
                                                                onClick={() => toast.dismiss(t2)}
                                                                variant={'secondary'}
                                                                size="sm"
                                                            >
                                                                Más tarde
                                                            </Button>
                                                            <Button
                                                                onClick={async () => {
                                                                    toast.dismiss(t2);
                                                                    await api.app.relaunch();
                                                                }}
                                                                variant={'default'}
                                                                size="sm"
                                                            >
                                                                Reiniciar ahora
                                                            </Button>
                                                        </CustomToastActions>
                                                    </CustomToast>
                                                ),
                                                { id: installingToast, duration: Infinity }
                                            );
                                        }
                                    });
                                } catch (e) {
                                    toast.error(`Error al actualizar: ${e}`, { id: installingToast });
                                }
                            }}
                            variant="default"
                            size="sm"
                        >
                            Actualizar
                        </Button>
                    </CustomToastActions>
                </CustomToast>
            ),
            { duration: Infinity }
        );
    }

    return { appVersion, tauriVersion, checkForUpdates, promptUpdate };
};

export { useUpdater };
