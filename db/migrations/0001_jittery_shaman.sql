CREATE TABLE `sprints` (
	`id` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`version` text,
	`goal` text,
	`status` text DEFAULT 'PLANNED' NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`created_by` text,
	`updated_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	`_updated_by` text,
	`is_active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `tasks` ADD `sprint_id` text REFERENCES sprints(id);--> statement-breakpoint
ALTER TABLE `tasks` ADD `version` text;