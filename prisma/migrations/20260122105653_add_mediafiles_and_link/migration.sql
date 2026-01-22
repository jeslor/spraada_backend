-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "contentMediaFiles" JSONB DEFAULT '[]',
ADD COLUMN     "link" TEXT,
ADD COLUMN     "profileMediaFiles" JSONB DEFAULT '[]';
