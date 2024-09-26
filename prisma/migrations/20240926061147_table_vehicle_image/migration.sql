/*
  Warnings:

  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `secondaryImage` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Image" DROP CONSTRAINT "Image_vehicleId_fkey";

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "secondaryImage" TEXT NOT NULL;

-- DropTable
DROP TABLE "Image";
