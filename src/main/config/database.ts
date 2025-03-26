import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { is } from '@electron-toolkit/utils';
import fs from 'node:fs'

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url)); // DEV

// Definir la ruta de la base de datos dinámicamente
const dbPath = is.dev
  ? path.join(__dirname, '../../src/renderer/public/musicData.db')
  : path.join(process.resourcesPath, 'app.asar.unpacked', 'out', 'renderer', 'musicData.db');


const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbPath);

export function initializeDatabase() {
  db.serialize(() => {
    // Crear tabla music
    db.run(`
      CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        song TEXT NOT NULL,
        video TEXT,
        image TEXT NOT NULL,
        reproductions INTEGER DEFAULT 0,
        duration TEXT,
        date TEXT NOT NULL
      )
    `);

    // Crear tabla playlists
    db.run(`
      CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        color TEXT NOT NULL,
        cover TEXT NOT NULL,
        date TEXT NOT NULL
      )
    `);

    // Crear tabla playlist_songs
    db.run(`
      CREATE TABLE IF NOT EXISTS playlist_songs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        playlist_id INTEGER NOT NULL,
        song_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
        FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE
      )
    `);
  });
}

export function getDb() {
  return db;
}
