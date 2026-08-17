use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(tag = "status")]
pub enum BinaryState {
    #[serde(rename = "READY")]
    Ready { version: String },
    #[serde(rename = "MISSING")]
    Missing,
    #[serde(rename = "UPDATE_AVAILABLE")]
    UpdateAvailable {
        #[serde(rename = "currentVersion")]
        current_version: String,
        #[serde(rename = "latestVersion")]
        latest_version: String,
    },
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DependenciesStatus {
    pub yt_dlp: BinaryState,
    pub ffmpeg: BinaryState,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct DownloadProgressPayload {
    pub binary: String,
    pub downloaded_bytes: u64,
    pub total_bytes: u64,
    pub percentage: f64,
}

#[derive(Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct DownloadConfig {
    pub url: String,
    pub format: String,
    pub extract_audio: bool,
    pub audio_format: Option<String>,
    pub embed_subs: bool,
}

#[derive(Serialize, Clone, Debug)]
pub struct ConsoleLogEvent {
    pub source: String,
    pub line: String,
}
