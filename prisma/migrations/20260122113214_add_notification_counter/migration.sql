-- CreateTable
CREATE TABLE "NotificationsCounter" (
    "id" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationsCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NotificationsCounter_profileId_key" ON "NotificationsCounter"("profileId");

-- AddForeignKey
ALTER TABLE "NotificationsCounter" ADD CONSTRAINT "NotificationsCounter_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
