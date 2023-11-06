/*
  Warnings:

  - You are about to drop the `_MatchToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user1Id` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user2Id` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_MatchToUser" DROP CONSTRAINT "_MatchToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_MatchToUser" DROP CONSTRAINT "_MatchToUser_B_fkey";

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "user1Id" INTEGER NOT NULL,
ADD COLUMN     "user2Id" INTEGER NOT NULL;

-- DropTable
DROP TABLE "_MatchToUser";

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
