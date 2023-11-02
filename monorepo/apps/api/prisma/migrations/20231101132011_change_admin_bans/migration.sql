/*
  Warnings:

  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Banned` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_AdminToChannel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BannedToChannel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Admin" DROP CONSTRAINT "Admin_userId_fkey";

-- DropForeignKey
ALTER TABLE "Banned" DROP CONSTRAINT "Banned_userId_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToChannel" DROP CONSTRAINT "_AdminToChannel_A_fkey";

-- DropForeignKey
ALTER TABLE "_AdminToChannel" DROP CONSTRAINT "_AdminToChannel_B_fkey";

-- DropForeignKey
ALTER TABLE "_BannedToChannel" DROP CONSTRAINT "_BannedToChannel_A_fkey";

-- DropForeignKey
ALTER TABLE "_BannedToChannel" DROP CONSTRAINT "_BannedToChannel_B_fkey";

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "admins" INTEGER[],
ADD COLUMN     "bans" INTEGER[];

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Banned";

-- DropTable
DROP TABLE "_AdminToChannel";

-- DropTable
DROP TABLE "_BannedToChannel";
