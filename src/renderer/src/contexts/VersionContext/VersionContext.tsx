import { createContext, useEffect, useState } from "react";
import { VersionInfo, YtDlpContextType } from "./VersionContext.types";

export const VersionContext = createContext<YtDlpContextType | undefined>(undefined);

export function VersionProvider({ children }: { children: React.ReactNode }) {
    const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
    const [appVersion, setAppVersion] = useState<VersionInfo | null>(null);
    const [loading, setLoading] = useState(false);

    const checkVersionApp = async () => {
        setLoading(true);
        const data = await window.api.verifyVersionApp();
        setAppVersion(data);
        setLoading(false);
    };

    const updateApp = async () => {
        setLoading(true);
        const data = await window.api.installLatestVersionApp();
        setAppVersion(data);
        setLoading(false);
    };
    

    const checkVersion = async () => {
        setLoading(true);
        const data = await window.api.verifyVersion();
        setVersionInfo(data);
        setLoading(false);
    };

    const updateYtDlp = async () => {
        setLoading(true);
        const data = await window.api.installLatestVersion();
        setVersionInfo(data);
        setLoading(false);
    };

    useEffect(() => {
        checkVersion();
        checkVersionApp();
        // Función para verificar la versión
        const intervalId = setInterval(() => {
            checkVersion();
            checkVersionApp();
        }, 300000);
    
        return () => clearInterval(intervalId);
    }, []);
    

    return (
        <VersionContext.Provider value={{ versionInfo, appVersion, loading, checkVersion, updateYtDlp, checkVersionApp, updateApp }}>
            {children}
        </VersionContext.Provider>
    );
}

