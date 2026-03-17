/*
  Warnings:

  - You are about to drop the column `requiresMagentaTV` on the `SpecialPrice` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `SpecialPrice` DROP COLUMN `requiresMagentaTV`,
    ADD COLUMN `magentaTVRequirement` VARCHAR(191) NOT NULL DEFAULT 'NONE';
