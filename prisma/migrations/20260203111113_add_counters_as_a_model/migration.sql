-- CreateTable
CREATE TABLE "ConversationParticipantUnreadCount" (
    "id" SERIAL NOT NULL,
    "conversationId" INTEGER NOT NULL,
    "profileId" INTEGER NOT NULL,
    "unreadCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ConversationParticipantUnreadCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConversationParticipantUnreadCount_conversationId_profileId_key" ON "ConversationParticipantUnreadCount"("conversationId", "profileId");

-- AddForeignKey
ALTER TABLE "ConversationParticipantUnreadCount" ADD CONSTRAINT "ConversationParticipantUnreadCount_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipantUnreadCount" ADD CONSTRAINT "ConversationParticipantUnreadCount_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
