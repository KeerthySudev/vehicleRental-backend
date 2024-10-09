/*
  Warnings:

  - You are about to drop the column `dropOff` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `pickUp` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `startDate` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `dropoffDate` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dropoffLocation` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dropoffTime` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupDate` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupLocation` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupTime` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "dropOff",
DROP COLUMN "endDate",
DROP COLUMN "pickUp",
DROP COLUMN "startDate",
ADD COLUMN     "dropoffDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "dropoffLocation" TEXT NOT NULL,
ADD COLUMN     "dropoffTime" TEXT NOT NULL,
ADD COLUMN     "pickupDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "pickupLocation" TEXT NOT NULL,
ADD COLUMN     "pickupTime" TEXT NOT NULL;
