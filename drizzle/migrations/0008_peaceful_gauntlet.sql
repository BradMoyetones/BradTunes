PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_playlist_songs` (
	`id` text PRIMARY KEY NOT NULL,
	`playlist_id` text NOT NULL,
	`song_id` text NOT NULL,
	`date` text NOT NULL,
	FOREIGN KEY (`playlist_id`) REFERENCES `playlists`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`song_id`) REFERENCES `songs`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_playlist_songs`("id", "playlist_id", "song_id", "date") SELECT "id", "playlist_id", "song_id", "date" FROM `playlist_songs`;--> statement-breakpoint
DROP TABLE `playlist_songs`;--> statement-breakpoint
ALTER TABLE `__new_playlist_songs` RENAME TO `playlist_songs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;