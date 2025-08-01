export type MusicPathContextType = {
    musicPath: string;
    defaultPath: boolean;
    isLoading: boolean;
    changePath: () => Promise<void>;
    resetPath: () => Promise<void>;
    varifyDefaultPath: () => Promise<void>;
};