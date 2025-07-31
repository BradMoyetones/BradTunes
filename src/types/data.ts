import { InferSelectModel } from 'drizzle-orm';
import { playlists, playlistSongs, songs } from '@core/drizzle/schema';

export type Playlist = InferSelectModel<typeof playlists>;
export type PlaylistSong = InferSelectModel<typeof playlistSongs>;
export type Song = InferSelectModel<typeof songs>;

export type PlaylistWithSongs = Playlist & {
    playlist_songs: (PlaylistSong & { song: Song | null })[];
};
