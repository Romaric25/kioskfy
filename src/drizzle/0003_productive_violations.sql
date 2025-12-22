ALTER TABLE `organizations` ADD `logoUploadId` int;--> statement-breakpoint
CREATE INDEX `organizations_logoUploadId_idx` ON `organizations` (`logoUploadId`);