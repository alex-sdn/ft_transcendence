-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "requestedId" INTEGER NOT NULL,

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FriendRequest_requesterId_requestedId_key" ON "FriendRequest"("requesterId", "requestedId");

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_requestedId_fkey" FOREIGN KEY ("requestedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
