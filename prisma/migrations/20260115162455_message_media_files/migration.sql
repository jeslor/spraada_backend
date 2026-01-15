/*
  Warnings:

  - You are about to drop the column `mediaUrls` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "mediaUrls",
ADD COLUMN     "mediaFiles" JSONB DEFAULT '[]';
