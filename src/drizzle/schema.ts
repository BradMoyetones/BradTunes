// drizzle/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// Tablas base
export const songs = sqliteTable("songs", {
    id: integer("id").primaryKey({ autoIncrement: true }),
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
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    color: text("color").notNull(),
    cover: text("cover"),
    date: text("date").notNull(),
});

export const playlistSongs = sqliteTable("playlist_songs", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playlistId: integer("playlist_id")
        .notNull()
        .references(() => playlists.id, { onDelete: "cascade" }),
    songId: integer("song_id")
        .notNull()
        .references(() => songs.id, { onDelete: "cascade" }),
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
