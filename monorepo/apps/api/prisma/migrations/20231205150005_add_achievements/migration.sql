/*
  Warnings:

  - You are about to drop the column `user1nick` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `user2nick` on the `Match` table. All the data in the column will be lost.
  - Added the required column `isCommand` to the `Privmsg` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "user1nick",
DROP COLUMN "user2nick";

-- AlterTable
ALTER TABLE "Privmsg" ADD COLUMN     "isCommand" BOOLEAN NOT NULL;

-- CreateTable
CREATE TABLE "Achievements" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "playOne" BOOLEAN NOT NULL DEFAULT false,
    "win3to0" BOOLEAN NOT NULL DEFAULT false,
    "win3inRow" BOOLEAN NOT NULL DEFAULT false,
    "reach500LP" BOOLEAN NOT NULL DEFAULT false,
    "win5" BOOLEAN NOT NULL DEFAULT false,
    "win10" BOOLEAN NOT NULL DEFAULT false,
    "win20" BOOLEAN NOT NULL DEFAULT false,
    "win50" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Achievements_userId_key" ON "Achievements"("userId");

-- AddForeignKey
ALTER TABLE "Achievements" ADD CONSTRAINT "Achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
