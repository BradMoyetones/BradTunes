use tauri::{AppHandle, Emitter};
use tokio::process::Command;
use std::process::Stdio;
use tokio::io::{AsyncBufReadExt, BufReader};

use crate::models::{ConsoleLogEvent, DownloadConfig};
use crate::commands::binaries::{get_binary_path, get_ffmpeg_dir};

fn build_args(config: &DownloadConfig, app: &AppHandle) -> Result<Vec<String>, String> {
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

    args.push(config.url.clone());
    
    Ok(args)
}

#[tauri::command]
pub async fn execute_download(app: AppHandle, config: DownloadConfig) -> Result<(), String> {
    let yt_dlp_path = get_binary_path(&app, "yt-dlp")?;
    let args = build_args(&config, &app)?;

    spawn_and_stream(app, yt_dlp_path.to_string_lossy().to_string(), args).await
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

    spawn_and_stream(app, yt_dlp_path.to_string_lossy().to_string(), final_args).await
}

async fn spawn_and_stream(app: AppHandle, binary_path: String, args: Vec<String>) -> Result<(), String> {
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

    // We can run wait asynchronously
    tokio::spawn(async move {
        let _ = child.wait().await;
        let _ = app.emit("download-finished", ());
    });

    Ok(())
}
