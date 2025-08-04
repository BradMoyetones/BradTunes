import { playlists, playlistSongs, songs } from '@core/drizzle/schema';
import { PlaylistSong, PlaylistSongFull } from '@core/types/data';
import { getDb } from '@core/drizzle/client';
import { and, eq } from 'drizzle-orm';
import { getTimestamp } from '../config/helpers';

export async function playlistSongAll(): Promise<PlaylistSong[]> {
  const db = await getDb();

  let rows = await db.query.playlistSongs.findMany();

  return rows;
}

export async function playlistSong(playlistId: number, songId: number): Promise<PlaylistSong | false> {
  const db = await getDb();

  const result = await db.select().from(playlistSongs)
    .where(
      and(
        eq(playlistSongs.playlistId, playlistId),
        eq(playlistSongs.songId, songId)
      )
    );

  return result[0] || false;
}

export async function addMusicToPlaylist(
  playlistId: number,
  songId: number,
): Promise<PlaylistSongFull> {
  const db = await getDb();
  const date = getTimestamp()
  // 1. Insertar en la tabla playlist_songs
  const [inserted] = await db
    .insert(playlistSongs)
    .values({ playlistId, songId, date })
    .returning();

  if (!inserted) throw new Error('Insert failed');

  // 2. Obtener la canción
  const [song] = await db
    .select()
    .from(songs)
    .where(eq(songs.id, songId))
    .limit(1);

  if (!song) throw new Error('Song not found');

  // 3. Obtener la playlist
  const [playlist] = await db
    .select()
    .from(playlists)
    .where(eq(playlists.id, playlistId))
    .limit(1);

  if (!playlist) throw new Error('Playlist not found');

  // 4. Retornar el objeto compuesto
  return {
    ...inserted,
    song,
    playlist,
  };
}

export async function deletePlaylistSong(
  playlistId: number,
  songId: number
): Promise<boolean> {
  const db = await getDb();

  const result = await db
    .delete(playlistSongs)
    .where(
      and(
        eq(playlistSongs.playlistId, playlistId),
        eq(playlistSongs.songId, songId)
      )
    );

  const { changes } = result;

  if (changes === 0) {
    throw new Error('Playlist song not found');
  }

  return true;
}