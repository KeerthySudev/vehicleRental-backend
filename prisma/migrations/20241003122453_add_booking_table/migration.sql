/*
  Warnings:

  - Added the required column `dropOff` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickUp` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "dropOff" TEXT NOT NULL,
ADD COLUMN     "pickUp" TEXT NOT NULL,
ALTER COLUMN "paymentStatus" SET DEFAULT 'pending';
