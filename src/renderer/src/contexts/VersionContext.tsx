import { createContext, useContext, useEffect, useState } from "react";

interface VersionInfo {
  currentVersion: string;
  newVersion: string | null;
  message: string;
}

interface YtDlpContextType {
  versionInfo: VersionInfo | null;
  appVersion: VersionInfo | null;
  loading: boolean;
  checkVersionApp: () => Promise<void>;
  updateApp: () => Promise<void>;
  checkVersion: () => Promise<void>;
  updateYtDlp: () => Promise<void>;
}

const VersionContext = createContext<YtDlpContextType | undefined>(undefined);

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
        checkVersion(); // Verifica la versión de YT-DLP
        checkVersionApp()
    }, []);

    return (
        <VersionContext.Provider value={{ versionInfo, appVersion, loading, checkVersion, updateYtDlp, checkVersionApp, updateApp }}>
            {children}
        </VersionContext.Provider>
    );
}

export function useVersion() {
    const context = useContext(VersionContext);
    if (!context) {
        throw new Error("useVersion must be used within a VersionProvider");
    }
    return context;
}
