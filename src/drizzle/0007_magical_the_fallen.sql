CREATE TABLE `accounting_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` varchar(36) NOT NULL,
	`transaction_type` enum('purchase','withdrawal','refund') NOT NULL,
	`referenceId` varchar(36) NOT NULL,
	`organizationAmount` decimal(10,2) NOT NULL,
	`platformAmount` decimal(10,2) NOT NULL,
	`organizationBalance` decimal(10,2) NOT NULL,
	`platformBalance` decimal(10,2) NOT NULL,
	`description` text,
	`currency` varchar(10) NOT NULL DEFAULT 'XAF',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accounting_ledger_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accounting_ledger` ADD CONSTRAINT `accounting_ledger_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `accounting_ledger_organizationId_idx` ON `accounting_ledger` (`organizationId`);--> statement-breakpoint
CREATE INDEX `accounting_ledger_transactionType_idx` ON `accounting_ledger` (`transaction_type`);--> statement-breakpoint
CREATE INDEX `accounting_ledger_referenceId_idx` ON `accounting_ledger` (`referenceId`);--> statement-breakpoint
CREATE INDEX `accounting_ledger_createdAt_idx` ON `accounting_ledger` (`createdAt`);