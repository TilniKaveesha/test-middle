-- AlterTable
ALTER TABLE "Suser" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'suser';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';
