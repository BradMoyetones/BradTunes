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
    pub extract_audio: bool,
    pub video_format: Option<String>,
    pub video_quality: Option<String>,
    pub audio_format: Option<String>,
    pub audio_quality: Option<String>,
    pub embed_subs: bool,
    pub embed_metadata: bool,
    pub embed_thumbnail: bool,
}

#[derive(Serialize, Clone, Debug)]
pub struct ConsoleLogEvent {
    pub source: String,
    pub line: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct VaultItem {
    pub id: String,
    pub title: String,
    pub artist: Option<String>,
    pub duration_sec: Option<i64>,
    pub has_video: bool,
    pub has_audio: bool,
    pub has_cover: bool,
    pub video_filename: Option<String>,
    pub audio_filename: Option<String>,
    pub cover_filename: Option<String>,
}

#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct VaultEvent {
    pub event_type: String, // "INSERTED", "UPDATED", "DELETED"
    pub item: VaultItem,
}
