// drizzle/client.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import * as schema from './schema';
import { getMigrationsPath, getMusicPath } from '../main/config/storage';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

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

const prueba = async() => {

    const oldDb = await getDbOld()

    const get = await oldDb.query.songs.findMany()

    console.log(get);
    
}

prueba()