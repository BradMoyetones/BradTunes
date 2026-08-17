use std::path::PathBuf;
use tauri::{AppHandle, Emitter, Manager};
use tokio::fs;
use tokio::io::AsyncWriteExt;
use futures_util::StreamExt;

use crate::models::{BinaryState, DependenciesStatus, DownloadProgressPayload};

pub fn get_app_data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let path = app.path().app_data_dir().map_err(|e| e.to_string())?;
    // Ensure dir exists
    std::fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    Ok(path)
}

pub fn get_binary_path(app: &AppHandle, binary: &str) -> Result<PathBuf, String> {
    let mut path = get_app_data_dir(app)?;
    
    #[cfg(target_os = "windows")]
    let bin_name = format!("{}.exe", binary);
    
    #[cfg(target_os = "macos")]
    let bin_name = if binary == "yt-dlp" { "yt-dlp_macos".to_string() } else { binary.to_string() };
    
    #[cfg(target_os = "linux")]
    let bin_name = binary.to_string();
    
    path.push(&bin_name);
    Ok(path)
}

pub fn get_ffmpeg_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let mut path = get_app_data_dir(app)?;
    path.push("ffmpeg-bin");
    std::fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    Ok(path)
}

#[tauri::command]
pub async fn check_dependencies(app: AppHandle) -> Result<DependenciesStatus, String> {
    let yt_dlp = check_binary(&app, "yt-dlp", "--version").await?;
    let ffmpeg = check_binary(&app, "ffmpeg", "-version").await?;
    
    Ok(DependenciesStatus { yt_dlp, ffmpeg })
}

async fn check_binary(app: &AppHandle, binary: &str, version_flag: &str) -> Result<BinaryState, String> {
    let path = if binary == "ffmpeg" {
        let mut p = get_ffmpeg_dir(app)?;
        #[cfg(target_os = "windows")]
        p.push("ffmpeg.exe");
        #[cfg(not(target_os = "windows"))]
        p.push("ffmpeg");
        p
    } else {
        get_binary_path(app, binary)?
    };

    if !path.exists() {
        return Ok(BinaryState::Missing);
    }

    let output = tokio::process::Command::new(&path)
        .arg(version_flag)
        .output()
        .await;

    match output {
        Ok(out) if out.status.success() => {
            let version = String::from_utf8_lossy(&out.stdout)
                .lines()
                .next()
                .unwrap_or("Unknown")
                .trim()
                .to_string();
            // TODO: Consultar GitHub releases para UPDATE_AVAILABLE
            Ok(BinaryState::Ready { version })
        }
        _ => Ok(BinaryState::Missing),
    }
}

#[tauri::command]
pub async fn install_binary(app: AppHandle, binary: String) -> Result<(), String> {
    let url = match binary.as_str() {
        "yt-dlp" => {
            #[cfg(target_os = "windows")]
            let url = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe";
            #[cfg(target_os = "macos")]
            let url = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos";
            #[cfg(target_os = "linux")]
            let url = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";
            url
        }
        "ffmpeg" => {
            // Placeholder: ffmpeg requires unzipping depending on the OS
            // En un sistema real usaríamos un endpoint de builds estáticos de ffmpeg
            // Por simplicidad en este blueprint asumiremos una descarga directa
            "https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-linux64-gpl.tar.xz"
        }
        _ => return Err("Binario no soportado".into()),
    };

    let path = if binary == "ffmpeg" {
        // En una app real, aquí descargaríamos el zip y lo extraeríamos en get_ffmpeg_dir()
        let mut p = get_ffmpeg_dir(&app)?;
        p.push("ffmpeg");
        p
    } else {
        get_binary_path(&app, &binary)?
    };

    let res = reqwest::get(url).await.map_err(|e| e.to_string())?;
    let total_bytes = res.content_length().unwrap_or(0);
    
    let mut file = fs::File::create(&path).await.map_err(|e| e.to_string())?;
    let mut stream = res.bytes_stream();
    let mut downloaded_bytes = 0;

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        file.write_all(&chunk).await.map_err(|e| e.to_string())?;
        downloaded_bytes += chunk.len() as u64;

        let percentage = if total_bytes > 0 {
            (downloaded_bytes as f64 / total_bytes as f64) * 100.0
        } else {
            0.0
        };

        let _ = app.emit("binary-download-progress", DownloadProgressPayload {
            binary: binary.clone(),
            downloaded_bytes,
            total_bytes,
            percentage,
        });
    }

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let mut perms = fs::metadata(&path).await.map_err(|e| e.to_string())?.permissions();
        perms.set_mode(0o755);
        fs::set_permissions(&path, perms).await.map_err(|e| e.to_string())?;
    }

    Ok(())
}
