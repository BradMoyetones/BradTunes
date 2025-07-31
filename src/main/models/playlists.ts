import path from 'node:path';
import fs from 'node:fs'
import { getTimestamp } from '../config/helpers';
import { getMusicPath } from '../config/storage';
import { getDb } from '@core/drizzle/client';
import { playlists as schemaPlaylists, playlistSongs, songs } from '@core/drizzle/schema';
import { eq, inArray } from 'drizzle-orm';
import { PlaylistWithSongs } from '@core/types/data';

// Definir rutas dinámicamente con is.dev
export async function playlists(): Promise<PlaylistWithSongs[]> {
  const db = await getDb();

  const allPlaylists = await db.select().from(schemaPlaylists).all();

  const allPlaylistSongs = await db.select()
    .from(playlistSongs)
    .where(inArray(playlistSongs.playlistId, allPlaylists.map(p => p.id)))
    .leftJoin(songs, eq(playlistSongs.songId, songs.id))
    .all();

  const playlistsWithSongs = allPlaylists.map(p => ({
    ...p,
    color: JSON.parse(p.color),
    playlist_songs: allPlaylistSongs
      .filter(ps => ps.playlist_songs.playlistId === p.id)
      .map(ps => ({
        ...ps.playlist_songs,
        song: ps.songs
      }))
  }));

  // console.log(JSON.stringify(playlistsWithSongs, null, 2));

  return playlistsWithSongs;
}

// Sanear nombre de archivo
const sanitizeFilename = (name: string) => {
  return name
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
};

export async function createPlaylist(
  title: string,
  color: { accent: string; dark: string },
  cover: string | undefined | null
): Promise<PlaylistWithSongs> {
  const db = await getDb();
  const timestamp = Date.now();
  const sanitizedName = sanitizeFilename(title);

  let coverPath: string | null = null;

  const base64Regex = /^data:image\/(?:jpeg|png|gif|bmp|webp);base64,/;
  if (cover && base64Regex.test(cover)) {
    try {
      const base64Data = cover.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const extensionMatch = cover.match(/^data:image\/(\w+);base64,/);
      const extension = extensionMatch ? extensionMatch[1] : 'png';

      const coverFilename = `${timestamp}_${sanitizedName}.${extension}`;

      const musicPath = await getMusicPath();
      const outputDir = musicPath;
      const imgDir = path.join(outputDir, 'img', 'playlists');

      [outputDir, imgDir].forEach((dir) => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
      });

      const coverDestination = path.join(imgDir, coverFilename);
      fs.writeFileSync(coverDestination, buffer);
      coverPath = coverFilename;
    } catch (err) {
      throw new Error(`Error saving cover image: ${(err as Error).message}`);
    }
  }

  const date = getTimestamp();

  const inserted = await db
    .insert(schemaPlaylists)
    .values({
      title,
      color: JSON.stringify(color),
      cover: coverPath,
      date,
    })
    .returning();

  const newPlaylist = inserted[0];

  return {
    ...newPlaylist,
    playlist_songs: [],
  };
}

export async function updatePlaylist(
  id: number | undefined,
  title: string,
  color: { accent: string; dark: string },
  cover: string | undefined
): Promise<PlaylistWithSongs> {
  if (!id) throw new Error('Playlist ID is required');

  const db = await getDb();

  // Obtener la playlist actual para acceder al cover anterior
  const current = await db
    .select({ cover: schemaPlaylists.cover })
    .from(schemaPlaylists)
    .where(eq(schemaPlaylists.id, id))
    .get();

  let coverPath: string | undefined;
  let oldCoverPath: string | undefined;

  const base64Regex = /^data:image\/(?:jpeg|png|gif|bmp|webp);base64,/;
  if (cover && base64Regex.test(cover)) {
    try {
      const timestamp = Date.now();
      const sanitizedName = title.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim();

      const base64Data = cover.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const extensionMatch = cover.match(/^data:image\/(\w+);base64,/);
      const extension = extensionMatch ? extensionMatch[1] : 'png';

      const coverFilename = `${timestamp}_${sanitizedName}.${extension}`;

      const musicPath = await getMusicPath();
      const imgDir = path.join(musicPath, 'img', 'playlists');

      if (!fs.existsSync(imgDir)) {
        fs.mkdirSync(imgDir, { recursive: true });
      }

      const coverDestination = path.join(imgDir, coverFilename);
      fs.writeFileSync(coverDestination, buffer);
      coverPath = coverFilename;

      // Guardar path anterior para eliminarlo luego
      if (current?.cover) {
        oldCoverPath = path.join(imgDir, current.cover);
      }
    } catch (err) {
      throw new Error(`Error saving cover image: ${(err as Error).message}`);
    }
  }

  await db
    .update(schemaPlaylists)
    .set({
      title,
      color: JSON.stringify(color),
      ...(coverPath ? { cover: coverPath } : {}),
    })
    .where(eq(schemaPlaylists.id, id));

  // Eliminar portada anterior si se cambió por una nueva
  if (oldCoverPath && fs.existsSync(oldCoverPath)) {
    fs.unlinkSync(oldCoverPath);
  }

  // Recargar playlist con relaciones
  const updatedPlaylist = await db
    .select()
    .from(schemaPlaylists)
    .where(eq(schemaPlaylists.id, id))
    .get();

  if (!updatedPlaylist) throw new Error('Playlist not found');

  const related = await db
    .select()
    .from(playlistSongs)
    .where(eq(playlistSongs.playlistId, id))
    .leftJoin(songs, eq(playlistSongs.songId, songs.id))
    .all();

  return {
    ...updatedPlaylist,
    playlist_songs: related.map(r => ({
      ...r.playlist_songs,
      song: r.songs
    }))
  };
}

export async function deletePlaylist(id: number): Promise<boolean> {
  const db = await getDb();

  try {
    // Obtener la playlist antes de eliminarla para saber si tiene cover
    const playlist = await db
      .select({ cover: schemaPlaylists.cover })
      .from(schemaPlaylists)
      .where(eq(schemaPlaylists.id, id))
      .get();

    // Eliminar canciones asociadas
    await db.delete(playlistSongs).where(eq(playlistSongs.playlistId, id));

    // Eliminar playlist
    await db.delete(schemaPlaylists).where(eq(schemaPlaylists.id, id));

    // Eliminar imagen del disco si existe
    if (playlist?.cover) {
      const musicPath = await getMusicPath();
      const imgDir = path.join(musicPath, 'img', 'playlists');
      const coverPath = path.join(imgDir, playlist.cover);

      if (fs.existsSync(coverPath)) {
        fs.unlinkSync(coverPath);
      }
    }

    return true;
  } catch (err) {
    console.error('Error deleting playlist:', err);
    return false;
  }
}