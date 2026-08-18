use notify::{Event, EventKind, RecursiveMode, Watcher};
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use crate::services::db::Database;
use crate::models::{VaultEvent, VaultItem};
use std::fs;

pub fn start_watcher(app: AppHandle, vault_path: PathBuf, db: Arc<Database>) {
    let app_clone = app.clone();
    
    std::thread::spawn(move || {
        let (tx, rx) = std::sync::mpsc::channel();

        let mut watcher = notify::recommended_watcher(tx).expect("Failed to create watcher");

        // Asegurar que la carpeta exista antes de observarla
        let _ = fs::create_dir_all(&vault_path);
        
        watcher.watch(&vault_path, RecursiveMode::Recursive).expect("Failed to watch vault path");

        for res in rx {
            match res {
                Ok(event) => {
                    handle_event(&app_clone, &db, &vault_path, event);
                },
                Err(e) => println!("watch error: {:?}", e),
            }
        }
    });
}

fn handle_event(app: &AppHandle, db: &Database, vault_root: &PathBuf, event: Event) {
    // macOS FSEvents a veces emite EventKind::Modify(Any) o EventKind::Other
    // Filtramos solo los eventos de lectura de datos o metadata puros para no saturar.
    match event.kind {
        EventKind::Access(_) | EventKind::Modify(notify::event::ModifyKind::Data(_)) | EventKind::Modify(notify::event::ModifyKind::Metadata(_)) => return,
        _ => {}
    }

    for path in event.paths {
        if let Ok(rel_path) = path.strip_prefix(vault_root) {
            let components: Vec<_> = rel_path.components().collect();
            if components.is_empty() { continue; }
            
            let id = components[0].as_os_str().to_string_lossy().to_string();
            let folder_path = vault_root.join(&id);

            // Obtenemos el item actual para comparar si realmente hubo cambios (Organic Debounce)
            let current_item = db.get_item(&id).unwrap_or(None);

            if !folder_path.exists() {
                // Se borró la carpeta entera (o se movió a la papelera)
                if current_item.is_some() {
                    let _ = db.delete(&id);
                    let _ = app.emit("vault-event", VaultEvent {
                        event_type: "DELETED".into(),
                        item: VaultItem {
                            id: id.clone(),
                            title: "".into(),
                            artist: None,
                            duration_sec: None,
                            has_video: false,
                            has_audio: false,
                            has_cover: false,
                            video_filename: None,
                            audio_filename: None,
                            cover_filename: None,
                        }
                    });
                }
            } else {
                // Se borró/movió/agregó un archivo dentro de la carpeta. Re-escaneamos:
                let mut video_filename = None;
                let mut audio_filename = None;
                let mut cover_filename = None;

                if let Ok(entries) = fs::read_dir(&folder_path) {
                    for entry in entries.flatten() {
                        let path = entry.path();
                        if let Some(ext) = path.extension().and_then(|e| e.to_str()) {
                            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                                match ext {
                                    "mp4" | "mkv" | "webm" => video_filename = Some(name.to_string()),
                                    "mp3" | "m4a" | "wav" | "ogg" | "flac" => audio_filename = Some(name.to_string()),
                                    "jpg" | "jpeg" | "png" | "webp" => cover_filename = Some(name.to_string()),
                                    _ => {}
                                }
                            }
                        }
                    }
                }

                let mut has_changes = true;
                if let Some(item) = &current_item {
                    if item.video_filename == video_filename 
                        && item.audio_filename == audio_filename 
                        && item.cover_filename == cover_filename {
                        has_changes = false;
                    }
                }

                // Solo actualizamos DB y emitimos si realmente las extensiones/archivos cambiaron
                if has_changes {
                    if let Ok(_) = db.update_paths(&id, video_filename, audio_filename, cover_filename) {
                        if let Ok(Some(full_item)) = db.get_item(&id) {
                            let _ = app.emit("vault-event", VaultEvent {
                                event_type: "UPDATED".into(),
                                item: full_item,
                            });
                        }
                    }
                }
            }
        }
    }
}
