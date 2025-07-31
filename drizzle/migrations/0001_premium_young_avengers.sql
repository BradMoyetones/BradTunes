PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_playlists` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`color` text NOT NULL,
	`cover` text,
	`date` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_playlists`("id", "title", "color", "cover", "date") SELECT "id", "title", "color", "cover", "date" FROM `playlists`;--> statement-breakpoint
DROP TABLE `playlists`;--> statement-breakpoint
ALTER TABLE `__new_playlists` RENAME TO `playlists`;--> statement-breakpoint
PRAGMA foreign_keys=ON;