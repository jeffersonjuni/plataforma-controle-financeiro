/*
  Warnings:

  - You are about to alter the column `type` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.
  - You are about to alter the column `type` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.

*/
-- DropForeignKey
ALTER TABLE `Account` DROP FOREIGN KEY `Account_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Transaction` DROP FOREIGN KEY `Transaction_accountId_fkey`;

-- AlterTable
ALTER TABLE `Account` MODIFY `type` ENUM('CORRENTE', 'POUPANCA', 'INVESTIMENTO') NOT NULL;

-- AlterTable
ALTER TABLE `Transaction` MODIFY `type` ENUM('ENTRADA', 'SAIDA') NOT NULL;

-- AlterTable
ALTER TABLE `User` ALTER COLUMN `updatedAt` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Account` RENAME INDEX `Account_userId_fkey` TO `Account_userId_idx`;

-- RenameIndex
ALTER TABLE `Transaction` RENAME INDEX `Transaction_accountId_fkey` TO `Transaction_accountId_idx`;
