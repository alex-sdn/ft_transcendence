/*
  Warnings:

  - Added the required column `user1nick` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user2nick` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "user1nick" TEXT NOT NULL,
ADD COLUMN     "user2nick" TEXT NOT NULL;
