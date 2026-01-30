-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "unreadCountParticipantOne" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unreadCountParticipantTwo" INTEGER NOT NULL DEFAULT 0;
