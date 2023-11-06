-- CreateTable
CREATE TABLE "Invited" (
    "id" SERIAL NOT NULL,
    "chanId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Invited_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invited_chanId_userId_key" ON "Invited"("chanId", "userId");

-- AddForeignKey
ALTER TABLE "Invited" ADD CONSTRAINT "Invited_chanId_fkey" FOREIGN KEY ("chanId") REFERENCES "Channel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invited" ADD CONSTRAINT "Invited_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
