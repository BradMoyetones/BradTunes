// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
var __electron_vite_injected_dirname = "/Users/imaca1418/Documents/ElectronJS/spotify-app-2";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@core": resolve(__electron_vite_injected_dirname, "src")
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@core": resolve(__electron_vite_injected_dirname, "src")
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        "@": resolve(__electron_vite_injected_dirname, "src/renderer/src"),
        "@core": resolve(__electron_vite_injected_dirname, "src")
      }
    },
    plugins: [react(), tailwindcss()]
  }
});
export {
  electron_vite_config_default as default
};
