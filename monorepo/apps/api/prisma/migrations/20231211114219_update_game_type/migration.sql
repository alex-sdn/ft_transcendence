/*
  Warnings:

  - The values [ranked,casual] on the enum `GameType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GameType_new" AS ENUM ('Robot', 'Retro', 'CoolCat');
ALTER TABLE "Match" ALTER COLUMN "type" TYPE "GameType_new" USING ("type"::text::"GameType_new");
ALTER TYPE "GameType" RENAME TO "GameType_old";
ALTER TYPE "GameType_new" RENAME TO "GameType";
DROP TYPE "GameType_old";
COMMIT;
