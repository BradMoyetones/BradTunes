import path from 'node:path';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import { getMusicPath } from './storage';

const require = createRequire(import.meta.url);
const sqlite3 = require('sqlite3').verbose();

let currentDbPath = ''; // Almacena la ruta actual de la DB
let db: any = null; // Almacena la instancia de la DB

const getDbPath = async (): Promise<string> => {
  const musicPath = await getMusicPath(); // 🔹 Ahora se espera el resultado
  return path.join(musicPath, '../musicData.db');
};

const ensureDbDirectoryExists = (dbPath: string) => {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
};

const isDatabaseCorrupt = (dbPath: string): boolean => {
  if (!fs.existsSync(dbPath)) return false; // No hay archivo, no está corrupto

  try {
    const testDb = new sqlite3.Database(dbPath);
    testDb.close();
    return false; // Si se abre sin errores, no está corrupta
  } catch (error) {
    console.error(`[DB] ❌ Base de datos corrupta detectada en: ${dbPath}`);
    return true;
  }
};

const openDatabase = async () => {
  const newDbPath = await getDbPath(); // 🔹 Espera la ruta de la DB

  if (db && newDbPath === currentDbPath) {
    return db;
  }

  if (db) db.close();

  ensureDbDirectoryExists(newDbPath);

  // Verificar si la DB está corrupta
  if (isDatabaseCorrupt(newDbPath)) {
    console.error(`[DB] 🔥 Eliminando base de datos corrupta: ${newDbPath}`);
    fs.unlinkSync(newDbPath); // Eliminar la base de datos corrupta
  }

  db = new sqlite3.Database(newDbPath, (err) => {
    if (err) {
      console.error(`[DB] ❌ Error al abrir la base de datos: ${err.message}`);
    } else {
      console.log(`[DB] ✅ Base de datos abierta correctamente.`);
      currentDbPath = newDbPath;
    }
  });

  return db;
};

// Inicializar la base de datos correctamente
(async () => {
  await openDatabase();
})();

export async function initializeDatabase() {
  const database = await openDatabase(); // 🔹 Espera la instancia de la DB

  database.serialize(() => {
    // Crear tabla music
    database.run(`
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
    database.run(`
      CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        color TEXT NOT NULL,
        cover TEXT NOT NULL,
        date TEXT NOT NULL
      )
    `);

    // Crear tabla playlist_songs
    database.run(`
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

export async function getDb() {
  return await openDatabase(); // 🔹 Ahora es asíncrono
}
