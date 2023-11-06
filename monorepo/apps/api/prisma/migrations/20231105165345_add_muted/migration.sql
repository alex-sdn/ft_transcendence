/*
  Warnings:

  - You are about to drop the column `mutes` on the `Channel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "mutes";

-- CreateTable
CREATE TABLE "Muted" (
    "id" SERIAL NOT NULL,
    "chanId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Muted_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Muted" ADD CONSTRAINT "Muted_chanId_fkey" FOREIGN KEY ("chanId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
