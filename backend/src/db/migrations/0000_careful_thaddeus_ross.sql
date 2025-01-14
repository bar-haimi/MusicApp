CREATE TABLE `playlistTable` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text(30) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `songHistory` (
	`user_id` integer NOT NULL,
	`song_link` text NOT NULL,
	`last_listen` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `songsInPlaylistTable` (
	`playlist_id` integer NOT NULL,
	`song_link` text NOT NULL,
	`song_name` text NOT NULL,
	FOREIGN KEY (`playlist_id`) REFERENCES `playlistTable`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`username` text(20) NOT NULL,
	`password` text NOT NULL
);
