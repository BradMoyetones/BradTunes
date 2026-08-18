use tauri::{AppHandle, Emitter};
use tokio::process::Command;
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, BufReader};
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::models::{ConsoleLogEvent, DownloadConfig, VaultItem};
use crate::commands::binaries::{get_binary_path, get_ffmpeg_dir};
use crate::services::db::Database;
use tauri::Manager;
use std::path::PathBuf;

fn build_args(config: &DownloadConfig, app: &AppHandle) -> Result<(Vec<String>, PathBuf), String> {
    let mut args = Vec::new();
    
    // Configurar ffmpeg local
    let ffmpeg_dir = get_ffmpeg_dir(app)?;
    args.push("--ffmpeg-location".into());
    args.push(ffmpeg_dir.to_string_lossy().to_string());

    // WORKAROUND: Bypass YouTube's 'tv_downgraded' UNPLAYABLE block & 403s
    args.push("--extractor-args".into());
    args.push("youtube:player-client=web,default".into()); // Try web first, then default
    
    // Bypass TLS fingerprinting
    args.push("--impersonate".into());
    args.push("chrome".into());

    if config.extract_audio {
        args.push("-x".into());
        
        let af = config.audio_format.as_deref().unwrap_or("mp3");
        args.push("--audio-format".into());
        args.push(af.to_string());

        if let Some(aq) = &config.audio_quality {
            args.push("--audio-quality".into());
            args.push(aq.clone());
        }
    } else {
        // Video
        let vf = config.video_format.as_deref().unwrap_or("mp4");
        let vq = config.video_quality.as_deref().unwrap_or("best");
        
        let format_str = if vq == "best" {
            format!("bestvideo[ext={}]+bestaudio/best", vf)
        } else {
            // Ejemplo de resolucion: vq = 1080
            format!("bestvideo[height<={}][ext={}]+bestaudio/best", vq, vf)
        };
        args.push("-f".into());
        args.push(format_str);
        
        args.push("--merge-output-format".into());
        args.push(vf.to_string());
    }

    if config.embed_subs {
        args.push("--write-subs".into());
        args.push("--write-auto-subs".into());
        args.push("--embed-subs".into());
    }

    if config.embed_metadata {
        args.push("--embed-metadata".into());
    }

    if config.embed_thumbnail {
        args.push("--embed-thumbnail".into());
        // CRUCIAL: yt-dlp deletes the thumbnail from disk after embedding it.
        // We MUST pass --write-thumbnail to force it to keep the standalone image
        // in the folder so our Vault UI can render the MediaCard cover!
        args.push("--write-thumbnail".into());
    }

    // Siempre guardamos el info.json temporalmente para sacar el ID y metadata
    args.push("--write-info-json".into());

    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let vault_path = app_data_dir.join("vault");
    let output_template = format!("{}/%(id)s/%(id)s.%(ext)s", vault_path.to_string_lossy());
    args.push("-o".into());
    args.push(output_template);

    args.push(config.url.clone());
    
    Ok((args, vault_path))
}

#[tauri::command]
pub async fn execute_download(app: AppHandle, config: DownloadConfig) -> Result<VaultItem, String> {
    let yt_dlp_path = get_binary_path(&app, "yt-dlp")?;
    let (args, vault_path) = build_args(&config, &app)?;

    let mut child = Command::new(&yt_dlp_path)
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
    let last_stderr = Arc::new(Mutex::new(String::new()));
    let last_stderr_clone = Arc::clone(&last_stderr);
    
    tokio::spawn(async move {
        let mut reader = BufReader::new(stderr).lines();
        while let Ok(Some(line)) = reader.next_line().await {
            let mut ls = last_stderr_clone.lock().await;
            *ls = line.clone();
            
            let _ = app_clone2.emit("console-log", ConsoleLogEvent { 
                source: "stderr".into(), 
                line 
            });
        }
    });

    let status = child.wait().await.map_err(|e| e.to_string())?;
    let _ = app.emit("download-finished", ());

    if !status.success() {
        let err_msg = last_stderr.lock().await.clone();
        return Err(format!("yt-dlp failed: {}", err_msg));
    }

    // Validación Estricta
    let db = app.state::<Arc<Database>>();
    
    let mut item_found: Option<VaultItem> = None;
    
    if let Ok(entries) = std::fs::read_dir(&vault_path) {
        for entry in entries.flatten() {
            let folder = entry.path();
            if folder.is_dir() {
                if let Some(id) = folder.file_name().and_then(|n| n.to_str()) {
                    let json_path = folder.join(format!("{}.info.json", id));
                    if json_path.exists() {
                        let content = std::fs::read_to_string(&json_path).unwrap_or_default();
                        if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                            let title = json["title"].as_str().unwrap_or("Unknown").to_string();
                            let artist = json["artist"].as_str().or(json["uploader"].as_str()).map(|s| s.to_string());
                            let duration_sec = json["duration"].as_i64();
                            
                            let mut video_filename = None;
                            let mut audio_filename = None;
                            let mut cover_filename = None;

                            if let Ok(sub_entries) = std::fs::read_dir(&folder) {
                                for sub_entry in sub_entries.flatten() {
                                    let file_path = sub_entry.path();
                                    if let Some(ext) = file_path.extension().and_then(|e| e.to_str()) {
                                        if let Some(name) = file_path.file_name().and_then(|n| n.to_str()) {
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

                            // Validación Estricta
                            if config.extract_audio && audio_filename.is_none() {
                                let _ = std::fs::remove_dir_all(&folder);
                                return Err("Audio extraction completed but file was missing or empty.".into());
                            }
                            if !config.extract_audio && video_filename.is_none() {
                                let _ = std::fs::remove_dir_all(&folder);
                                return Err("Video download completed but file was missing or empty.".into());
                            }
                            if config.embed_thumbnail && cover_filename.is_none() {
                                let _ = std::fs::remove_dir_all(&folder);
                                return Err("Thumbnail extraction was requested but the cover image was missing or empty.".into());
                            }

                            let item = VaultItem {
                                id: id.to_string(),
                                title,
                                artist,
                                duration_sec,
                                has_video: video_filename.is_some(),
                                has_audio: audio_filename.is_some(),
                                has_cover: cover_filename.is_some() || config.embed_thumbnail,
                                video_filename: video_filename.clone(),
                                audio_filename: audio_filename.clone(),
                                cover_filename: cover_filename.clone(),
                            };

                            let _ = db.insert_or_update(&item);
                            let _ = std::fs::remove_file(&json_path);
                            
                            item_found = Some(item);
                            break;
                        }
                    }
                }
            }
        }
    }

    match item_found {
        Some(item) => Ok(item),
        None => Err("Download succeeded but no output files were found in the vault.".into())
    }
}

#[tauri::command]
pub async fn execute_console_command(app: AppHandle, args: Vec<String>) -> Result<(), String> {
    let yt_dlp_path = get_binary_path(&app, "yt-dlp")?;
    let ffmpeg_dir = get_ffmpeg_dir(&app)?;
    
    let mut final_args = Vec::new();
    final_args.push("--ffmpeg-location".into());
    final_args.push(ffmpeg_dir.to_string_lossy().to_string());
    final_args.extend(args);

    let mut child = Command::new(&yt_dlp_path)
        .args(&final_args)
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
    let last_stderr = Arc::new(Mutex::new(String::new()));
    let last_stderr_clone = Arc::clone(&last_stderr);
    tokio::spawn(async move {
        let mut reader = BufReader::new(stderr).lines();
        while let Ok(Some(line)) = reader.next_line().await {
            let mut ls = last_stderr_clone.lock().await;
            *ls = line.clone();
            let _ = app_clone2.emit("console-log", ConsoleLogEvent { 
                source: "stderr".into(), 
                line 
            });
        }
    });

    let status = child.wait().await.map_err(|e| e.to_string())?;
    let _ = app.emit("download-finished", ());

    if !status.success() {
        let err_msg = last_stderr.lock().await.clone();
        return Err(err_msg);
    }
    
    Ok(())
}
