/*
  Warnings:

  - You are about to drop the column `userId` on the `Blocked` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[blockerId,blockedId]` on the table `Blocked` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `blockedId` to the `Blocked` table without a default value. This is not possible if the table is not empty.
  - Added the required column `blockerId` to the `Blocked` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Blocked" DROP CONSTRAINT "Blocked_userId_fkey";

-- DropIndex
DROP INDEX "Blocked_userId_key";

-- AlterTable
ALTER TABLE "Blocked" DROP COLUMN "userId",
ADD COLUMN     "blockedId" INTEGER NOT NULL,
ADD COLUMN     "blockerId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Blocked_blockerId_blockedId_key" ON "Blocked"("blockerId", "blockedId");

-- AddForeignKey
ALTER TABLE "Blocked" ADD CONSTRAINT "Blocked_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blocked" ADD CONSTRAINT "Blocked_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
