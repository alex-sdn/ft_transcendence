/*
  Warnings:

  - Added the required column `isCommand` to the `Chanmsg` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Chanmsg" ADD COLUMN     "isCommand" BOOLEAN NOT NULL;
