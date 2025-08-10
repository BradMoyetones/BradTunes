// drizzle/client.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import * as schema from './schema';
import { getMigrationsPath, getMusicPath } from '../main/config/storage';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { v4 as uuidv4 } from 'uuid';

let currentDbPath = '';
let db: Database.Database | null = null;

const ensureDbDirectoryExists = (dbPath: string) => {
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }
};

const isDatabaseCorrupt = (dbPath: string): boolean => {
    if (!fs.existsSync(dbPath)) return false;
    try {
        const testDb = new Database(dbPath);
        testDb.close();
        return false;
    } catch (error) {
        console.error(`[DB] ❌ Base de datos corrupta detectada: ${dbPath}`);
        return true;
    }
};

const openDatabase = async (): Promise<Database.Database> => {
    const musicPath = await getMusicPath();
    const newDbPath = path.join(musicPath, '../musicData_new.db');

    if (db && newDbPath === currentDbPath) return db;

    if (db) db.close();

    ensureDbDirectoryExists(newDbPath);

    if (isDatabaseCorrupt(newDbPath)) {
        fs.unlinkSync(newDbPath);
        console.warn(`[DB] 🔥 Base de datos corrupta eliminada: ${newDbPath}`);
    }

    db = new Database(newDbPath);
    currentDbPath = newDbPath;

    return db;
};

export const getDb = async () => {
    const musicPath = await getMusicPath();
    const dbPath = path.join(musicPath, '../musicData_new.db');

    // 🔥 Elimina primero si no existe la tabla de migraciones
    const rawTmp = new Database(dbPath); // sin drizzle todavía
    const table: any = rawTmp
        .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='__drizzle_migrations';`)
        .get();
    rawTmp.close();

    if (!table || table.name !== '__drizzle_migrations') {
        console.warn('[DB] 🧨 No existe tabla de migraciones. Eliminando archivo DB...');
        fs.unlinkSync(dbPath);
    }

    // Ahora sí, abre la conexión definitiva
    const raw = await openDatabase();
    const client = drizzle(raw, { schema });

    // Ejecutar migraciones
    migrate(client, {
        migrationsFolder: getMigrationsPath(),
    });

    return client;
};

export const getDbOld = async () => {
    const musicPath = await getMusicPath();
    const dbPath = path.join(musicPath, '../musicData.db');
    
    const rawTmp = await new Database(dbPath); // sin drizzle todavía

    const client = drizzle(rawTmp, { schema });

    return client
}

export const getOldDataAll = async() => {

    const oldDb = await getDbOld()

    try {
        const getSongs = await oldDb.query.songs.findMany()
        const getPlaylists = await oldDb.query.playlists.findMany()
        const getPlaylistSongs = await oldDb.query.playlistSongs.findMany()

        return {
            oldSongs: getSongs,
            oldPlaylists: getPlaylists,
            oldPlaylistSongs: getPlaylistSongs
        }
    } catch (error) {
        console.log(error);
        return {
            oldSongs: [],
            oldPlaylists: [],
            oldPlaylistSongs: [],
        }
    }
}

// Convierte "4:14" a 254
const durationToSeconds = (time: string) => {
    const [m, s] = time.split(':').map(Number);
    return (m * 60) + s;
};

export const restoreOldData = async (data) => {
    try{

    
        const db = await getDb();
        const oldData = await getOldDataAll();

        // Mapa para IDs
        const songIdMap = new Map();
        const playlistIdMap = new Map();

        // SONGS
        const songsToInsert = oldData.oldSongs
            .filter(s => data.songs.some(sel => sel.id === Number(s.id)))
            .map(s => {
                const newId = uuidv4();
                songIdMap.set(s.id, newId);
                return {
                    id: newId,
                    title: s.title,
                    artist: s.artist,
                    song: s.song,
                    video: s.video,
                    image: s.image,
                    reproductions: s.reproductions ?? 0,
                    duration: durationToSeconds(String(s.duration)),
                    date: s.date,
                };
            });

        // PLAYLISTS
        const playlistsToInsert = oldData.oldPlaylists
            .filter(p => data.playlists.some(sel => sel.id === Number(p.id)))
            .map(p => {
                const newId = uuidv4();
                playlistIdMap.set(p.id, newId);
                return {
                    id: newId,
                    title: p.title,
                    cover: p.cover,
                    date: p.date,
                };
            });

        // PLAYLIST_SONGS
        const playlistSongsToInsert = oldData.oldPlaylistSongs
            .filter(ps => data.playlistSongs.some(sel => sel.id === Number(ps.id)))
            .map(ps => ({
                id: uuidv4(),
                playlistId: playlistIdMap.get(ps.playlistId),
                songId: songIdMap.get(ps.songId),
                date: ps.date,
            }))
            // Por si hay alguna referencia inválida
            .filter(ps => ps.playlistId && ps.songId);

        // Inserciones en orden
        await db.insert(schema.songs).values(songsToInsert);
        await db.insert(schema.playlists).values(playlistsToInsert);
        await db.insert(schema.playlistSongs).values(playlistSongsToInsert);

        try {
            const musicPath = await getMusicPath();
            const oldDbPath = path.join(musicPath, '../musicData.db');
            if (fs.existsSync(oldDbPath)) {
                fs.unlinkSync(oldDbPath);
                console.log(`[DB] 🧹 Base de datos vieja eliminada: ${oldDbPath}`);
            }
        } catch (err) {
            console.error(`[DB] ❌ No se pudo eliminar la base de datos vieja:`, err);
        }

        return true
    }catch (e){
        console.log(e);
        return false
    }
};
