use rusqlite::{Connection, Result};
use std::path::PathBuf;
use crate::models::VaultItem;
use std::sync::Mutex;

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new(db_path: PathBuf) -> Result<Self> {
        let conn = Connection::open(db_path)?;
        let db = Database { conn: Mutex::new(conn) };
        db.init()?;
        Ok(db)
    }

    fn init(&self) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "CREATE TABLE IF NOT EXISTS vault_items (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                artist TEXT,
                duration_sec INTEGER,
                path_video TEXT,
                path_audio TEXT,
                path_cover TEXT
            )",
            [],
        )?;
        Ok(())
    }

    pub fn insert_or_update(&self, item: &VaultItem, path_video: Option<String>, path_audio: Option<String>, path_cover: Option<String>) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO vault_items (id, title, artist, duration_sec, path_video, path_audio, path_cover)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
             ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                artist = excluded.artist,
                duration_sec = excluded.duration_sec,
                path_video = excluded.path_video,
                path_audio = excluded.path_audio,
                path_cover = excluded.path_cover",
            (
                &item.id,
                &item.title,
                &item.artist,
                item.duration_sec,
                path_video,
                path_audio,
                path_cover,
            ),
        )?;
        Ok(())
    }
    
    pub fn update_paths(&self, id: &str, path_video: Option<String>, path_audio: Option<String>, path_cover: Option<String>) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE vault_items SET 
                path_video = ?1,
                path_audio = ?2,
                path_cover = ?3
             WHERE id = ?4",
            (path_video, path_audio, path_cover, id),
        )?;
        Ok(())
    }

    pub fn get_all(&self) -> Result<Vec<VaultItem>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, title, artist, duration_sec, path_video, path_audio, path_cover FROM vault_items")?;
        let item_iter = stmt.query_map([], |row| {
            let path_video: Option<String> = row.get(4)?;
            let path_audio: Option<String> = row.get(5)?;
            let path_cover: Option<String> = row.get(6)?;
            
            Ok(VaultItem {
                id: row.get(0)?,
                title: row.get(1)?,
                artist: row.get(2)?,
                duration_sec: row.get(3)?,
                has_video: path_video.is_some(),
                has_audio: path_audio.is_some(),
                has_cover: path_cover.is_some(),
            })
        })?;

        let mut items = Vec::new();
        for item in item_iter {
            items.push(item?);
        }
        Ok(items)
    }

    pub fn delete(&self, id: &str) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM vault_items WHERE id = ?1", [id])?;
        Ok(())
    }

    pub fn get_item(&self, id: &str) -> Result<Option<VaultItem>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, title, artist, duration_sec, path_video, path_audio, path_cover FROM vault_items WHERE id = ?1")?;
        
        let mut rows = stmt.query([id])?;
        if let Some(row) = rows.next()? {
            let path_video: Option<String> = row.get(4)?;
            let path_audio: Option<String> = row.get(5)?;
            let path_cover: Option<String> = row.get(6)?;

            Ok(Some(VaultItem {
                id: row.get(0)?,
                title: row.get(1)?,
                artist: row.get(2)?,
                duration_sec: row.get(3)?,
                has_video: path_video.is_some(),
                has_audio: path_audio.is_some(),
                has_cover: path_cover.is_some(),
            }))
        } else {
            Ok(None)
        }
    }

    pub fn update_metadata(&self, id: &str, title: &str, artist: Option<&str>) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE vault_items SET title = ?1, artist = ?2 WHERE id = ?3",
            (title, artist, id),
        )?;
        Ok(())
    }
}
