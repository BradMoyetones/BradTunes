import { Playlist, PlaylistSongs, PlaylistSongsFull, Song } from '../../types/data';
import { getDb } from '../config/database';

export async function playlistSong(playlistId: number, songId: number): Promise<PlaylistSongs | false> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const query = `
      SELECT id, playlist_id, song_id, date 
      FROM playlist_songs 
      WHERE playlist_id = ? AND song_id = ?
    `;
    db.get(query, [playlistId, songId], (err: Error | null, row: PlaylistSongs | undefined) => {
      if (err) {
        reject(`Error fetching playlist songs: ${err.message}`);
      } else {
        resolve(row || false);
      }
    });
  });
}

export async function addMusicToPlaylist(playlistId: number, songId: number, date: string): Promise<PlaylistSongsFull> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    // Paso 1: Insertar el nuevo registro en playlist_songs
    const query = 'INSERT INTO playlist_songs (playlist_id, song_id, date) VALUES (?, ?, ?)';
    db.run(query, [playlistId, songId, date], function (err: Error | null) {
      if (err) {
        reject(`Error creating playlist song: ${err.message}`);
      } else {
        // Paso 2: Obtener la canción y la lista de reproducción usando los IDs
        const songQuery = 'SELECT * FROM songs WHERE id = ?';
        const playlistQuery = 'SELECT * FROM playlists WHERE id = ?';

        db.get(songQuery, [songId], (songErr: Error | null, songRow: Song | undefined) => {
          if (songErr) {
            reject(`Error fetching song: ${songErr.message}`);
            return;
          }

          db.get(playlistQuery, [playlistId], (playlistErr: Error | null, playlistRow: Playlist | undefined) => {
            if (playlistErr) {
              reject(`Error fetching playlist: ${playlistErr.message}`);
              return;
            }

            // Paso 3: Devolver el objeto completo con los detalles de la canción y la lista de reproducción
            resolve({
              id: db.lastID, // `this.lastID` contiene el ID del último registro insertado
              playlist_id: playlistId,
              song_id: songId,
              date: date,
              song: songRow || ({} as Song), // Si no se encuentra la canción, se asigna un objeto vacío
              playlist: playlistRow || ({} as Playlist), // Si no se encuentra la lista, se asigna un objeto vacío
            });
          });
        });
      }
    });
  });
}

export async function deletePlaylistSong(playlistId: number, songId: number): Promise<boolean> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const query = 'DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?';
    db.run(query, [playlistId, songId], function (err: Error | null) {
      if (err) {
        reject(`Error deleting playlist song: ${err.message}`);
      } else if (db.changes === 0) {
        reject(`Playlist song not found`);
      } else {
        resolve(true);
      }
    });
  });
}