// drizzle/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid';

// Tablas base
export const songs = sqliteTable("songs", {
    id: text("id").primaryKey().$defaultFn(() => uuidv4()),
    title: text("title").notNull(),
    artist: text("artist").notNull(),
    song: text("song").notNull(),
    video: text("video"),
    image: text("image").notNull(),
    reproductions: integer("reproductions").default(0),
    duration: integer("duration").notNull(),
    date: text("date").notNull(),
});

export const playlists = sqliteTable("playlists", {
    id: text("id").primaryKey().$defaultFn(() => uuidv4()),
    title: text("title").notNull(),
    cover: text("cover"),
    date: text("date").notNull(),
});

export const playlistSongs = sqliteTable("playlist_songs", {
    id: text("id").primaryKey().$defaultFn(() => uuidv4()),
    playlistId: text("playlist_id")
        .notNull()
        .references(() => playlists.id, { onDelete: "cascade", onUpdate: "cascade" }),
    songId: text("song_id")
        .notNull()
        .references(() => songs.id, { onDelete: "cascade", onUpdate: "cascade" }),
    date: text("date").notNull(),
});

// Relaciones
export const songsRelations = relations(songs, ({ many }) => ({
    playlist_songs: many(playlistSongs),
}));

export const playlistsRelations = relations(playlists, ({ many }) => ({
    playlist_songs: many(playlistSongs),
}));

export const playlistSongsRelations = relations(playlistSongs, ({ one }) => ({
    song: one(songs, {
        fields: [playlistSongs.songId],
        references: [songs.id],
    }),
    playlist: one(playlists, {
        fields: [playlistSongs.playlistId],
        references: [playlists.id],
    }),
}));
