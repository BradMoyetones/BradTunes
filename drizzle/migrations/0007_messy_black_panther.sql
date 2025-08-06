PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_playlist_songs` (
	`id` text PRIMARY KEY NOT NULL,
	`playlist_id` integer NOT NULL,
	`song_id` integer NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_playlist_songs`("id", "playlist_id", "song_id", "date") SELECT "id", "playlist_id", "song_id", "date" FROM `playlist_songs`;--> statement-breakpoint
DROP TABLE `playlist_songs`;--> statement-breakpoint
ALTER TABLE `__new_playlist_songs` RENAME TO `playlist_songs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_playlists` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`cover` text,
	`date` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_playlists`("id", "title", "cover", "date") SELECT "id", "title", "cover", "date" FROM `playlists`;--> statement-breakpoint
DROP TABLE `playlists`;--> statement-breakpoint
ALTER TABLE `__new_playlists` RENAME TO `playlists`;--> statement-breakpoint
CREATE TABLE `__new_songs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`song` text NOT NULL,
	`video` text,
	`image` text NOT NULL,
	`reproductions` integer DEFAULT 0,
	`duration` integer NOT NULL,
	`date` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_songs`("id", "title", "artist", "song", "video", "image", "reproductions", "duration", "date") SELECT "id", "title", "artist", "song", "video", "image", "reproductions", "duration", "date" FROM `songs`;--> statement-breakpoint
DROP TABLE `songs`;--> statement-breakpoint
ALTER TABLE `__new_songs` RENAME TO `songs`;