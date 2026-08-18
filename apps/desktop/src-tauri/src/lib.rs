pub mod services;
mod commands;
pub mod models;
mod errors;
use tauri::{Manager, RunEvent};
use tauri_plugin_os;

use window_vibrancy::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .setup(|app| {
            let window = app.get_webview_window("main").unwrap();

            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                .expect("No se pudo aplicar el Vibrancy en macOS");

            #[cfg(target_os = "windows")]
            apply_acrylic(&window, Some((0, 0, 0, 0)))
                .expect("Unsupported platform! 'apply_blur' is only supported on Windows");

            // Configurar AppDataDir para DB y Vault
            let app_data_dir = app.path().app_data_dir().unwrap();
            std::fs::create_dir_all(&app_data_dir).unwrap();
            
            let db_path = app_data_dir.join("vault.db");
            let db = std::sync::Arc::new(services::db::Database::new(db_path).expect("Failed to initialize database"));
            
            let vault_path = app_data_dir.join("vault");
            std::fs::create_dir_all(&vault_path).unwrap();
            
            // Iniciar Watcher asíncrono
            services::watcher::start_watcher(app.handle().clone(), vault_path, db.clone());
            
            // Inyectar DB en el estado de Tauri
            app.manage(db);

            Ok(())
        })
        .invoke_handler(commands::get_handlers())
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, _event| {
            // macOS: Reopen event when user clicks the dock icon
            #[cfg(target_os = "macos")]
            if let RunEvent::Reopen { .. } = &_event {
                if let Some(window) = _app_handle.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.unminimize();
                    let _ = window.set_focus();
                }
            }
        });
}
