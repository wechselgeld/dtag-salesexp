/*
  Warnings:

  - A unique constraint covering the columns `[verificationToken]` on the table `SalesSession` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Addon` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `News` ADD COLUMN `locationId` VARCHAR(191) NULL,
    ADD COLUMN `odRegionId` VARCHAR(191) NULL,
    ADD COLUMN `teamId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `magentaInfosUrl` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `SalesSession` ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `firstName` VARCHAR(191) NULL,
    ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastName` VARCHAR(191) NULL,
    ADD COLUMN `verificationExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `verificationToken` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `SpecialPrice` ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `internalNote` VARCHAR(191) NULL,
    ADD COLUMN `requiresNewActivation` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `SpecialPriceTier` ADD COLUMN `discountTarget` VARCHAR(191) NOT NULL DEFAULT 'BASE_PRICE',
    ADD COLUMN `discountType` VARCHAR(191) NOT NULL DEFAULT 'ABSOLUTE';

-- AlterTable
ALTER TABLE `Team` ADD COLUMN `email` VARCHAR(191) NOT NULL DEFAULT 'team06@telekom.de',
    ADD COLUMN `locationId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `isEditor` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `locationId` VARCHAR(191) NULL,
    ADD COLUMN `odRegionId` VARCHAR(191) NULL,
    ADD COLUMN `teamId` VARCHAR(191) NULL,
    MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'TEAM_LEADER';

-- CreateTable
CREATE TABLE `OdRegion` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Location` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `odRegionId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PriceHistory` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `label` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalyticsEvent` (
    `id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `eventType` VARCHAR(50) NOT NULL,
    `path` VARCHAR(255) NULL,
    `productId` VARCHAR(50) NULL,
    `category` VARCHAR(50) NULL,
    `teamId` VARCHAR(50) NULL,
    `count` INTEGER NOT NULL DEFAULT 1,

    INDEX `AnalyticsEvent_date_idx`(`date`),
    INDEX `AnalyticsEvent_eventType_idx`(`eventType`),
    INDEX `AnalyticsEvent_productId_idx`(`productId`),
    UNIQUE INDEX `AnalyticsEvent_date_eventType_path_productId_category_teamId_key`(`date`, `eventType`, `path`, `productId`, `category`, `teamId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `SalesSession_verificationToken_key` ON `SalesSession`(`verificationToken`);

-- CreateIndex
CREATE INDEX `Team_locationId_idx` ON `Team`(`locationId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_odRegionId_fkey` FOREIGN KEY (`odRegionId`) REFERENCES `OdRegion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Location` ADD CONSTRAINT `Location_odRegionId_fkey` FOREIGN KEY (`odRegionId`) REFERENCES `OdRegion`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceHistory` ADD CONSTRAINT `PriceHistory_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `News` ADD CONSTRAINT `News_odRegionId_fkey` FOREIGN KEY (`odRegionId`) REFERENCES `OdRegion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `News` ADD CONSTRAINT `News_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `News` ADD CONSTRAINT `News_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
