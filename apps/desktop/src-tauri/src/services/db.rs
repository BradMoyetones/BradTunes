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

        // MIGRATION: Add new filename columns if they don't exist
        let _ = conn.execute("ALTER TABLE vault_items ADD COLUMN video_filename TEXT", []);
        let _ = conn.execute("ALTER TABLE vault_items ADD COLUMN audio_filename TEXT", []);
        let _ = conn.execute("ALTER TABLE vault_items ADD COLUMN cover_filename TEXT", []);

        Ok(())
    }

    pub fn insert_or_update(&self, item: &VaultItem) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO vault_items (id, title, artist, duration_sec, video_filename, audio_filename, cover_filename)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
             ON CONFLICT(id) DO UPDATE SET
                title = excluded.title,
                artist = excluded.artist,
                duration_sec = excluded.duration_sec,
                video_filename = excluded.video_filename,
                audio_filename = excluded.audio_filename,
                cover_filename = excluded.cover_filename",
            (
                &item.id,
                &item.title,
                &item.artist,
                item.duration_sec,
                &item.video_filename,
                &item.audio_filename,
                &item.cover_filename,
            ),
        )?;
        Ok(())
    }
    
    pub fn update_paths(&self, id: &str, video_filename: Option<String>, audio_filename: Option<String>, cover_filename: Option<String>) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE vault_items SET 
                video_filename = ?1,
                audio_filename = ?2,
                cover_filename = ?3
             WHERE id = ?4",
            (video_filename, audio_filename, cover_filename, id),
        )?;
        Ok(())
    }

    pub fn get_all(&self) -> Result<Vec<VaultItem>> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT id, title, artist, duration_sec, video_filename, audio_filename, cover_filename FROM vault_items")?;
        let item_iter = stmt.query_map([], |row| {
            let video_filename: Option<String> = row.get(4)?;
            let audio_filename: Option<String> = row.get(5)?;
            let cover_filename: Option<String> = row.get(6)?;
            
            Ok(VaultItem {
                id: row.get(0)?,
                title: row.get(1)?,
                artist: row.get(2)?,
                duration_sec: row.get(3)?,
                has_video: video_filename.is_some(),
                has_audio: audio_filename.is_some(),
                has_cover: cover_filename.is_some(),
                video_filename,
                audio_filename,
                cover_filename,
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
        let mut stmt = conn.prepare("SELECT id, title, artist, duration_sec, video_filename, audio_filename, cover_filename FROM vault_items WHERE id = ?1")?;
        
        let mut rows = stmt.query([id])?;
        if let Some(row) = rows.next()? {
            let video_filename: Option<String> = row.get(4)?;
            let audio_filename: Option<String> = row.get(5)?;
            let cover_filename: Option<String> = row.get(6)?;

            Ok(Some(VaultItem {
                id: row.get(0)?,
                title: row.get(1)?,
                artist: row.get(2)?,
                duration_sec: row.get(3)?,
                has_video: video_filename.is_some(),
                has_audio: audio_filename.is_some(),
                has_cover: cover_filename.is_some(),
                video_filename,
                audio_filename,
                cover_filename,
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
