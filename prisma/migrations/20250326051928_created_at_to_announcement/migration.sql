/*
  Warnings:

  - Added the required column `startTime` to the `event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "announcement" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "event" ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL;
