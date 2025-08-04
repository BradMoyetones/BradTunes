import { InferSelectModel } from 'drizzle-orm';
import { playlists, playlistSongs, songs } from '@core/drizzle/schema';
import { ColorType } from '@core/lib/colors';


export type Playlist = InferSelectModel<typeof playlists>;

export type PlaylistColor = InferSelectModel<typeof playlists> & {
    color: ColorType;
};

export type PlaylistSong = InferSelectModel<typeof playlistSongs>;
export type Song = InferSelectModel<typeof songs>;

export type PlaylistWithSongs = PlaylistColor & {
    playlist_songs: (PlaylistSong & { song: Song | null })[];
};

export type PlaylistSongFull = PlaylistSong & {
    song: Song;
    playlist: Playlist;
};

export type SongFull = Song & {
    playlist_songs: PlaylistSong[];
};

export type PlaylistFull = PlaylistColor & {
    playlist_songs: PlaylistSong[];
};