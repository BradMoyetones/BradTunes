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
            let url = "https://github.com/yt-dlp/yt-dlp-master-builds/releases/latest/download/yt-dlp.exe";
            #[cfg(target_os = "macos")]
            let url = "https://github.com/yt-dlp/yt-dlp-master-builds/releases/latest/download/yt-dlp_macos";
            #[cfg(target_os = "linux")]
            let url = "https://github.com/yt-dlp/yt-dlp-master-builds/releases/latest/download/yt-dlp";
            url
        }
        "ffmpeg" => {
            #[cfg(target_os = "macos")]
            let url = "https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffmpeg-6.1-macos-64.zip";
            #[cfg(target_os = "windows")]
            let url = "https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffmpeg-6.1-win-64.zip";
            #[cfg(target_os = "linux")]
            let url = "https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffmpeg-6.1-linux-64.zip";
            url
        }
        _ => return Err("Binario no soportado".into()),
    };

    let download_path = if binary == "ffmpeg" {
        let mut p = get_ffmpeg_dir(&app)?;
        p.push("ffmpeg.zip");
        p
    } else {
        get_binary_path(&app, &binary)?
    };

    let res = reqwest::get(url).await.map_err(|e| e.to_string())?;
    let total_bytes = res.content_length().unwrap_or(0);
    
    let mut file = fs::File::create(&download_path).await.map_err(|e| e.to_string())?;
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

    if binary == "ffmpeg" {
        let extract_dir = get_ffmpeg_dir(&app)?;
        
        #[cfg(unix)]
        let status = std::process::Command::new("unzip")
            .arg("-o")
            .arg(&download_path)
            .arg("-d")
            .arg(&extract_dir)
            .status()
            .map_err(|e| format!("Failed to extract zip: {}", e))?;

        #[cfg(windows)]
        let status = std::process::Command::new("tar")
            .arg("-xf")
            .arg(&download_path)
            .arg("-C")
            .arg(&extract_dir)
            .status()
            .map_err(|e| format!("Failed to extract zip: {}", e))?;

        if !status.success() {
            return Err("Failed to extract ffmpeg zip archive".into());
        }

        // Limpiar el zip
        let _ = std::fs::remove_file(&download_path);

        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mut exe_path = extract_dir.clone();
            exe_path.push("ffmpeg");
            if exe_path.exists() {
                let mut perms = fs::metadata(&exe_path).await.map_err(|e| e.to_string())?.permissions();
                perms.set_mode(0o755);
                fs::set_permissions(&exe_path, perms).await.map_err(|e| e.to_string())?;
            }
        }
    } else {
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            let mut perms = fs::metadata(&download_path).await.map_err(|e| e.to_string())?.permissions();
            perms.set_mode(0o755);
            fs::set_permissions(&download_path, perms).await.map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}
