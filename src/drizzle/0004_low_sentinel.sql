ALTER TABLE `uploads` DROP FOREIGN KEY `uploads_organizationId_organizations_id_fk`;
--> statement-breakpoint
DROP INDEX `uploads_organizationId_idx` ON `uploads`;--> statement-breakpoint
ALTER TABLE `uploads` DROP COLUMN `organizationId`;