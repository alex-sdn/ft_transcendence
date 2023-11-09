/*
  Warnings:

  - You are about to drop the column `admins` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `bans` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the column `owner` on the `Channel` table. All the data in the column will be lost.
  - You are about to drop the `Muted` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ChannelToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Muted" DROP CONSTRAINT "Muted_chanId_fkey";

-- DropForeignKey
ALTER TABLE "Muted" DROP CONSTRAINT "Muted_userId_fkey";

-- DropForeignKey
ALTER TABLE "_ChannelToUser" DROP CONSTRAINT "_ChannelToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChannelToUser" DROP CONSTRAINT "_ChannelToUser_B_fkey";

-- AlterTable
ALTER TABLE "Channel" DROP COLUMN "admins",
DROP COLUMN "bans",
DROP COLUMN "owner";

-- DropTable
DROP TABLE "Muted";

-- DropTable
DROP TABLE "_ChannelToUser";

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "chanId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "owner" BOOLEAN NOT NULL DEFAULT false,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "muteEnd" TIMESTAMP(3),

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banned" (
    "id" SERIAL NOT NULL,
    "chanId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Banned_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Member_chanId_userId_key" ON "Member"("chanId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Banned_chanId_userId_key" ON "Banned"("chanId", "userId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_chanId_fkey" FOREIGN KEY ("chanId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banned" ADD CONSTRAINT "Banned_chanId_fkey" FOREIGN KEY ("chanId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Banned" ADD CONSTRAINT "Banned_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
