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
    const newDbPath = path.join(musicPath, '../musicData.db');

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
    const raw = await openDatabase();
    const client = drizzle(raw, { schema });

    const tables: any = raw.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='__drizzle_migrations';`
    ).get();

    if (!tables || tables.name !== '__drizzle_migrations') {
        console.warn('[DB] 🧨 No existe tabla de migraciones. Dropeando todas las tablas existentes.');

        const allTables: any = raw.prepare(`SELECT name FROM sqlite_master WHERE type='table';`).all();
        for (const { name } of allTables) {
            raw.prepare(`DROP TABLE IF EXISTS "${name}";`).run();
        }
    }

    // 🔄 Ejecutar migraciones si es necesario
    migrate(client, {
        migrationsFolder: getMigrationsPath(),
    });

    return client;
};
