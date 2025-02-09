/*
  Warnings:

  - You are about to alter the column `status` on the `Rent` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `name` on the `Scooter` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `serialNumber` on the `Scooter` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `licensePlate` on the `Scooter` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "Rent" ALTER COLUMN "status" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "Scooter" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "serialNumber" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "licensePlate" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);
