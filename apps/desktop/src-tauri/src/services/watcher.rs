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
    if !matches!(event.kind, EventKind::Remove(_)) {
        return; // Por ahora solo nos interesa sincronizar eliminaciones "out-of-band"
    }

    for path in event.paths {
        // La estructura es vault_root / ID / archivo
        if let Ok(rel_path) = path.strip_prefix(vault_root) {
            let components: Vec<_> = rel_path.components().collect();
            if components.len() == 1 {
                // Se borró la carpeta entera del ID
                let id = components[0].as_os_str().to_string_lossy().to_string();
                if let Ok(_) = db.delete(&id) {
                    let _ = app.emit("vault-event", VaultEvent {
                        event_type: "DELETED".into(),
                        item: VaultItem {
                            id,
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
            } else if components.len() == 2 {
                // Se borró un archivo dentro de la carpeta ID
                let id = components[0].as_os_str().to_string_lossy().to_string();
                
                // Re-escaneamos la carpeta para ver qué quedó
                let folder_path = vault_root.join(&id);
                if !folder_path.exists() {
                    // Si no existe, se borró todo
                    let _ = db.delete(&id);
                    let _ = app.emit("vault-event", VaultEvent {
                        event_type: "DELETED".into(),
                        item: VaultItem {
                            id,
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
                } else {
                    // Verificamos qué archivos quedan
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

                    // Actualizamos DB
                    if let Ok(_) = db.update_paths(&id, video_filename.clone(), audio_filename.clone(), cover_filename.clone()) {
                        // Omitir título y otros metadatos en el evento para evitar DB hits extras. El frontend puede hacer merge de `has_video`, etc.
                        let _ = app.emit("vault-event", VaultEvent {
                            event_type: "UPDATED".into(),
                            item: VaultItem {
                                id,
                                title: "".into(),
                                artist: None,
                                duration_sec: None,
                                has_video: video_filename.is_some(),
                                has_audio: audio_filename.is_some(),
                                has_cover: cover_filename.is_some(),
                                video_filename,
                                audio_filename,
                                cover_filename,
                            }
                        });
                    }
                }
            }
        }
    }
}
