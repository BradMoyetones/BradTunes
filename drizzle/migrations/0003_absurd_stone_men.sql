PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_songs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
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
ALTER TABLE `__new_songs` RENAME TO `songs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;