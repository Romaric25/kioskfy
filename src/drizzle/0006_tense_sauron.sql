CREATE TABLE `revenue_shares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` varchar(36) NOT NULL,
	`organizationId` varchar(36) NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`platformAmount` decimal(10,2) NOT NULL,
	`organizationAmount` decimal(10,2) NOT NULL,
	`platformPercentage` decimal(5,2) NOT NULL DEFAULT '25.00',
	`organizationPercentage` decimal(5,2) NOT NULL DEFAULT '75.00',
	`currency` varchar(10) NOT NULL DEFAULT 'XAF',
	`revenue_share_status` enum('pending','processed','paid_out','cancelled') NOT NULL DEFAULT 'pending',
	`processedAt` timestamp,
	`paidOutAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `revenue_shares_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_favorite_countries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` varchar(255) NOT NULL,
	`countryId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_favorite_countries_id` PRIMARY KEY(`id`),
	CONSTRAINT `ufc_user_country_idx` UNIQUE(`userId`,`countryId`)
);
--> statement-breakpoint
ALTER TABLE `orders` RENAME COLUMN `order_status` TO `status`;--> statement-breakpoint
ALTER TABLE `revenue_shares` ADD CONSTRAINT `revenue_shares_orderId_orders_id_fk` FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `revenue_shares` ADD CONSTRAINT `revenue_shares_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_favorite_countries` ADD CONSTRAINT `user_favorite_countries_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_favorite_countries` ADD CONSTRAINT `user_favorite_countries_countryId_countries_id_fk` FOREIGN KEY (`countryId`) REFERENCES `countries`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `revenue_shares_orderId_idx` ON `revenue_shares` (`orderId`);--> statement-breakpoint
CREATE INDEX `revenue_shares_organizationId_idx` ON `revenue_shares` (`organizationId`);--> statement-breakpoint
CREATE INDEX `revenue_shares_status_idx` ON `revenue_shares` (`revenue_share_status`);--> statement-breakpoint
CREATE INDEX `ufc_userId_idx` ON `user_favorite_countries` (`userId`);--> statement-breakpoint
CREATE INDEX `ufc_countryId_idx` ON `user_favorite_countries` (`countryId`);