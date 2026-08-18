use tauri::{AppHandle, Emitter};
use tokio::process::Command;
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, BufReader};

use crate::models::{ConsoleLogEvent, DownloadConfig, VaultItem};
use crate::commands::binaries::{get_binary_path, get_ffmpeg_dir};
use crate::services::db::Database;
use std::sync::Arc;
use tauri::Manager;
use std::path::PathBuf;

fn build_args(config: &DownloadConfig, app: &AppHandle) -> Result<(Vec<String>, PathBuf), String> {
    let mut args = Vec::new();
    
    // Configurar ffmpeg local
    let ffmpeg_dir = get_ffmpeg_dir(app)?;
    args.push("--ffmpeg-location".into());
    args.push(ffmpeg_dir.to_string_lossy().to_string());

    if config.extract_audio {
        args.push("-x".into());
        if let Some(format) = &config.audio_format {
            args.push("--audio-format".into());
            args.push(format.clone());
        }
    }

    if config.embed_subs {
        args.push("--embed-subs".into());
    }

    args.push("-f".into());
    args.push(config.format.clone());

    // Añadir metadatos y portada
    args.push("--write-info-json".into());
    args.push("--write-thumbnail".into());

    // Plantilla de salida hiper-estructurada
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let vault_path = app_data_dir.join("vault");
    let output_template = format!("{}/%(id)s/%(id)s.%(ext)s", vault_path.to_string_lossy());
    args.push("-o".into());
    args.push(output_template);

    args.push(config.url.clone());
    
    Ok((args, vault_path))
}

#[tauri::command]
pub async fn execute_download(app: AppHandle, config: DownloadConfig) -> Result<(), String> {
    let yt_dlp_path = get_binary_path(&app, "yt-dlp")?;
    let (args, vault_path) = build_args(&config, &app)?;

    spawn_and_stream(app, yt_dlp_path.to_string_lossy().to_string(), args, Some(vault_path)).await
}

#[tauri::command]
pub async fn execute_console_command(app: AppHandle, args: Vec<String>) -> Result<(), String> {
    let yt_dlp_path = get_binary_path(&app, "yt-dlp")?;
    
    // Interceptar y añadir ffmpeg-location obligatoriamente por seguridad y consistencia
    let mut final_args = Vec::new();
    let ffmpeg_dir = get_ffmpeg_dir(&app)?;
    final_args.push("--ffmpeg-location".into());
    final_args.push(ffmpeg_dir.to_string_lossy().to_string());
    final_args.extend(args);

    spawn_and_stream(app, yt_dlp_path.to_string_lossy().to_string(), final_args, None).await
}

async fn spawn_and_stream(app: AppHandle, binary_path: String, args: Vec<String>, vault_path: Option<PathBuf>) -> Result<(), String> {
    let mut child = Command::new(&binary_path)
        .args(&args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| e.to_string())?;

    let stdout = child.stdout.take().ok_or("Failed to open stdout")?;
    let stderr = child.stderr.take().ok_or("Failed to open stderr")?;

    let app_clone1 = app.clone();
    tokio::spawn(async move {
        let mut reader = BufReader::new(stdout).lines();
        while let Ok(Some(line)) = reader.next_line().await {
            let _ = app_clone1.emit("console-log", ConsoleLogEvent { 
                source: "stdout".into(), 
                line 
            });
        }
    });

    let app_clone2 = app.clone();
    tokio::spawn(async move {
        let mut reader = BufReader::new(stderr).lines();
        while let Ok(Some(line)) = reader.next_line().await {
            let _ = app_clone2.emit("console-log", ConsoleLogEvent { 
                source: "stderr".into(), 
                line 
            });
        }
    });

    let app_clone3 = app.clone();
    tokio::spawn(async move {
        let _ = child.wait().await;
        
        // Al finalizar, escaneamos la carpeta vault si es una descarga controlada
        if let Some(vault_path) = vault_path {
            // Un escaneo rápido de las subcarpetas para insertar los JSONs en SQLite
            if let Ok(entries) = std::fs::read_dir(&vault_path) {
                let db = app_clone3.state::<Arc<Database>>();
                for entry in entries.flatten() {
                    let folder = entry.path();
                    if folder.is_dir() {
                        if let Some(id) = folder.file_name().and_then(|n| n.to_str()) {
                            let json_path = folder.join(format!("{}.info.json", id));
                            if json_path.exists() {
                                if let Ok(content) = std::fs::read_to_string(&json_path) {
                                    if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                                        let title = json["title"].as_str().unwrap_or("Unknown").to_string();
                                        let artist = json["artist"].as_str().map(|s| s.to_string());
                                        let duration_sec = json["duration"].as_i64();
                                        
                                        // Verificar qué archivos existen
                                        let mut path_video = None;
                                        let mut path_audio = None;
                                        let mut path_cover = None;

                                        if let Ok(sub_entries) = std::fs::read_dir(&folder) {
                                            for sub_entry in sub_entries.flatten() {
                                                let file_path = sub_entry.path();
                                                if let Some(ext) = file_path.extension().and_then(|e| e.to_str()) {
                                                    match ext {
                                                        "mp4" | "mkv" | "webm" => path_video = Some(file_path.to_string_lossy().to_string()),
                                                        "mp3" | "m4a" | "wav" | "ogg" | "flac" => path_audio = Some(file_path.to_string_lossy().to_string()),
                                                        "jpg" | "jpeg" | "png" | "webp" => path_cover = Some(file_path.to_string_lossy().to_string()),
                                                        _ => {}
                                                    }
                                                }
                                            }
                                        }

                                        let item = VaultItem {
                                            id: id.to_string(),
                                            title,
                                            artist,
                                            duration_sec,
                                            has_video: path_video.is_some(),
                                            has_audio: path_audio.is_some(),
                                            has_cover: path_cover.is_some(),
                                        };

                                        let _ = db.insert_or_update(&item, path_video, path_audio, path_cover);
                                        
                                        // Borrar el info.json para no ocupar espacio
                                        let _ = std::fs::remove_file(&json_path);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        let _ = app_clone3.emit("download-finished", ());
    });

    Ok(())
}
