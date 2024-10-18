-- CreateTable
CREATE TABLE "Test" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "otherImages" TEXT[],

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);
