import { path } from "./modules/path";
import { window } from "./modules/window";
import { app, type Update } from "./modules/app";
import { getOSInfo, type OSInfo } from "./modules/get-all-platform-info";
import { binaries, type BinaryState, type DependenciesStatus, type DownloadProgressPayload } from "./modules/binaries";
import { downloader, type DownloadConfig } from "./modules/downloader";
import { consoleStream, type ConsoleLogEvent } from "./modules/console";

export { 
    getOSInfo, type OSInfo, type Update,
    type BinaryState, type DependenciesStatus, type DownloadProgressPayload,
    type DownloadConfig, type ConsoleLogEvent
};

export const api = {
    app,
    window,
    path,
    binaries,
    downloader,
    consoleStream
}