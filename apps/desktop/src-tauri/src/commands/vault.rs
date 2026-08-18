use tauri::State;
use std::sync::Arc;
use crate::models::VaultItem;
use crate::services::db::Database;

#[tauri::command]
pub fn get_all_items(db: State<'_, Arc<Database>>) -> Result<Vec<VaultItem>, String> {
    db.get_all().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_item(id: String, db: State<'_, Arc<Database>>) -> Result<Option<VaultItem>, String> {
    db.get_item(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_item(id: String, db: State<'_, Arc<Database>>) -> Result<(), String> {
    db.delete(&id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_item_metadata(id: String, title: String, artist: Option<String>, db: State<'_, Arc<Database>>) -> Result<(), String> {
    db.update_metadata(&id, &title, artist.as_deref()).map_err(|e| e.to_string())
}
