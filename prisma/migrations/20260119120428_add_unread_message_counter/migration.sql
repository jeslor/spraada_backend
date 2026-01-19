/*
  Warnings:

  - A unique constraint covering the columns `[profileId]` on the table `UnreadMessagesCounter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UnreadMessagesCounter_profileId_key" ON "UnreadMessagesCounter"("profileId");
