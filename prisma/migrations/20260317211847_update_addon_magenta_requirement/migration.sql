/*
  Warnings:

  - You are about to drop the column `requiresNoMagentaTV` on the `Addon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Addon` DROP COLUMN `requiresNoMagentaTV`,
    ADD COLUMN `magentaTVRequirement` VARCHAR(191) NOT NULL DEFAULT 'NONE',
    MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `allowHardwareTiers` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `description` TEXT NULL;

-- AlterTable
ALTER TABLE `SpecialPrice` MODIFY `description` TEXT NULL,
    MODIFY `internalNote` TEXT NULL;
