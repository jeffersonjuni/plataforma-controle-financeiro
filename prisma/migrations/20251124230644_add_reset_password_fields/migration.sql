-- AlterTable
ALTER TABLE `User` ADD COLUMN `resetToken` VARCHAR(255) NULL,
    ADD COLUMN `resetTokenExp` DATETIME(3) NULL;
