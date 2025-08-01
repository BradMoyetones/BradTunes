export interface VersionInfo {
    currentVersion: string;
    newVersion: string | null;
    message: string;
}

export interface YtDlpContextType {
    versionInfo: VersionInfo | null;
    appVersion: VersionInfo | null;
    loading: boolean;
    checkVersionApp: () => Promise<void>;
    updateApp: () => Promise<void>;
    checkVersion: () => Promise<void>;
    updateYtDlp: () => Promise<void>;
}