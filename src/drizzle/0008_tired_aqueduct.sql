CREATE TABLE `withdrawals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` varchar(36) NOT NULL,
	`userId` varchar(255),
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(10) NOT NULL DEFAULT 'XAF',
	`withdrawal_status` enum('pending','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`paymentDetails` text,
	`externalReference` varchar(255),
	`notes` text,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `withdrawals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
RENAME TABLE `accounting_ledger` TO `organization_balances`;--> statement-breakpoint
ALTER TABLE `organization_balances` DROP FOREIGN KEY `accounting_ledger_organizationId_organizations_id_fk`;
--> statement-breakpoint
DROP INDEX `accounting_ledger_organizationId_idx` ON `organization_balances`;--> statement-breakpoint
DROP INDEX `accounting_ledger_transactionType_idx` ON `organization_balances`;--> statement-breakpoint
DROP INDEX `accounting_ledger_referenceId_idx` ON `organization_balances`;--> statement-breakpoint
DROP INDEX `accounting_ledger_createdAt_idx` ON `organization_balances`;--> statement-breakpoint
ALTER TABLE `organization_balances` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `organization_balances` MODIFY COLUMN `organizationAmount` decimal(10,2) NOT NULL DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `organization_balances` MODIFY COLUMN `platformAmount` decimal(10,2) NOT NULL DEFAULT '0.00';--> statement-breakpoint
ALTER TABLE `organization_balances` ADD PRIMARY KEY(`id`);--> statement-breakpoint
ALTER TABLE `organizations` ADD `suspended` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `organizations` ADD `suspendedReason` text;--> statement-breakpoint
ALTER TABLE `organizations` ADD `suspendedUntil` timestamp;--> statement-breakpoint
ALTER TABLE `organization_balances` ADD `totalSales` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `organization_balances` ADD `totalWithdrawals` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `organization_balances` ADD `withdrawnAmount` decimal(10,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `organization_balances` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `organization_balances` ADD CONSTRAINT `organization_balances_organizationId_unique` UNIQUE(`organizationId`);--> statement-breakpoint
ALTER TABLE `withdrawals` ADD CONSTRAINT `withdrawals_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `withdrawals` ADD CONSTRAINT `withdrawals_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `withdrawals_organizationId_idx` ON `withdrawals` (`organizationId`);--> statement-breakpoint
CREATE INDEX `withdrawals_status_idx` ON `withdrawals` (`withdrawal_status`);--> statement-breakpoint
CREATE INDEX `withdrawals_requestedAt_idx` ON `withdrawals` (`requestedAt`);--> statement-breakpoint
ALTER TABLE `organization_balances` ADD CONSTRAINT `organization_balances_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `organization_balances_organizationId_idx` ON `organization_balances` (`organizationId`);--> statement-breakpoint
ALTER TABLE `organization_balances` DROP COLUMN `transaction_type`;--> statement-breakpoint
ALTER TABLE `organization_balances` DROP COLUMN `referenceId`;--> statement-breakpoint
ALTER TABLE `organization_balances` DROP COLUMN `organizationBalance`;--> statement-breakpoint
ALTER TABLE `organization_balances` DROP COLUMN `platformBalance`;--> statement-breakpoint
ALTER TABLE `organization_balances` DROP COLUMN `description`;