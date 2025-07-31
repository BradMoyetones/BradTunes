CREATE TABLE `playlist_songs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playlist_id` integer NOT NULL,
	`song_id` integer NOT NULL,
	`date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `playlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`color` text NOT NULL,
	`cover` text NOT NULL,
	`date` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `songs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`song` text NOT NULL,
	`video` text,
	`image` text NOT NULL,
	`reproductions` integer DEFAULT 0,
	`duration` text,
	`date` text NOT NULL
);
