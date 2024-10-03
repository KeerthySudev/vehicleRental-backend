-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "isRentable" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "secondaryImage" DROP NOT NULL;
