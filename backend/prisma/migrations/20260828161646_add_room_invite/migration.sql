-- AlterTable
ALTER TABLE "DirectMessage" ADD COLUMN     "roomCode" TEXT,
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'TEXT';
