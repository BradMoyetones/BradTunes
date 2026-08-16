import { path } from "./modules/path";
import { window } from "./modules/window";
import { app, type Update } from "./modules/app";
import { getOSInfo, OSInfo } from "./modules/get-all-platform-info";

export { getOSInfo, OSInfo, Update };

export const api = {
    app,
    window,
    path
}