import { Bell } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Notification } from "@/store/useNotifications"
import { useNotifications } from "@/store/useNotifications"
import { useEffect } from 'react'
import { useVersion } from '@/contexts/VersionContext'
import semver from 'semver'

export function Notificaciones() {
    // const [notificaciones, setNotificaciones] = useState<Notification[]>(notificacionesIniciales)
    const { appVersion, versionInfo } = useVersion()
    
    const { notifications, addNotification, markAsRead } = useNotifications()
    
    const marcarComoLeida = (id: number) => {
        markAsRead(id);
    };

    const notificacionesNoLeidas = notifications.filter(n => !n.read).length

    useEffect(() => {
        if (versionInfo && versionInfo.newVersion && versionInfo.currentVersion) {
            
            const newVersion = versionInfo.newVersion;
            const currentVersion = versionInfo.currentVersion;
    
            // Convertir el formato YYYY.MM.DD a YYYYMMDD para facilitar la comparación
            const newVersionDate = newVersion.replace(/\./g, '');
            const currentVersionDate = currentVersion.replace(/\./g, '');
    
            // Verificar si la nueva versión es mayor
            if (parseInt(newVersionDate) > parseInt(currentVersionDate)) {
                // Verificar si la notificación ya existe
                const existingNotification = notifications.find((notif) =>
                    notif.description.includes(newVersion)
                );
    
                if (!existingNotification) {
                    const newNotification: Notification = {
                        id: Date.now(),
                        title: 'YTDLP Update',
                        description: `New YTDLP version available: ${newVersion}. Please update.`,
                        read: false,
                        date: new Date(),
                    };
                    addNotification(newNotification);
                }
            }
        }
    }, [versionInfo, notifications, addNotification]);    
    
    useEffect(() => {
        if (appVersion && appVersion.newVersion && semver.gt(appVersion.newVersion, appVersion.currentVersion)) {
            const newVersion = appVersion.newVersion;
            if (typeof newVersion === 'string') {
                // Verificar si la notificación ya existe
                const existingNotification = notifications.find((notif) =>
                    notif.description.includes(newVersion)
                );
    
                if (!existingNotification) {
                    const newNotification: Notification = {
                        id: Date.now(),
                        title: 'App Update',
                        description: `New app version available: ${newVersion}. Please update.`,
                        read: false,
                        date: new Date(),
                    };
                    addNotification(newNotification);
                }
            }
        }
    }, [appVersion, notifications, addNotification]);    
    

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="relative no-drag">
                    <Bell className="h-4 w-4" />
                    {notificacionesNoLeidas > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                            {notificacionesNoLeidas}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80 no-drag">
                <ScrollArea className="h-[300px] w-full rounded-md p-4 no-drag">
                    {notifications.length > 0 ? (
                        notifications
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Ordenar por fecha de manera descendente
                            .map((notificacion) => (
                                <CardNotificacion 
                                    key={notificacion.id} 
                                    notification={notificacion} 
                                    callBack={marcarComoLeida}
                                />
                            ))
                    ) : (
                        <p className="text-center text-sm text-muted-foreground">
                            No found notifications
                        </p>
                    )}

                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}



interface NotificationProps {
    notification: Notification;
    callBack: (id: number) => void;
    textButton?: string;
}

const CardNotificacion = ({ notification, callBack, textButton }: NotificationProps) => {
    return (
        <div className={`mb-4 last:mb-0 p-2 rounded ${notification.read ? 'bg-accent/50' : 'bg-primary/50'}`}>
            <h4 className="font-semibold">{notification.title}</h4>
            <p className="text-sm">{notification.description}</p>
            <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                    {new Date(notification.date).toLocaleString()}
                </p>
                {!notification.read && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                            e.stopPropagation();
                            callBack(notification.id);
                        }}
                    >
                        {textButton || 'Mark as read'}
                    </Button>
                )}
            </div>
        </div>
    )
}