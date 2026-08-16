import type { OsType } from '@tauri-apps/plugin-os';
import { platform, arch, type, version } from '@tauri-apps/plugin-os';

export interface OSInfo {
    platform: string;
    architecture: string;
    osType: OsType;
    kernelVersion: string;
}

/**
 * Gets all platform information.
 */
export const getOSInfo = async () => {
    try {
        /**
         * Gets the platform of the operating system.
         */
        const platformInfo = await platform();
        /**
         * Gets the architecture of the operating system.
         */
        const architectureInfo = await arch();
        /**
         * Gets the type of the operating system.
         */
        const osType = await type();
        /**
         * Gets the version of the operating system.
         */
        const kernelVersion = await version();
        return {
            platform: platformInfo,
            architecture: architectureInfo,
            osType: osType,
            kernelVersion: kernelVersion,
        } as OSInfo;
    } catch (err) {
        console.error(err);
        return null;
    }
};
