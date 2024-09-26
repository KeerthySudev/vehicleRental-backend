/*
  Warnings:

  - You are about to drop the column `extraPaths` on the `Image` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "extraPaths",
ADD COLUMN     "images" TEXT[];
