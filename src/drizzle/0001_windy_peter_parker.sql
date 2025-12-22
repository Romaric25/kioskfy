ALTER TABLE `organizations` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT (now());--> statement-breakpoint
ALTER TABLE `organizations` ADD `updatedAt` timestamp;