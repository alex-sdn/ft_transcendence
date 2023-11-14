-- CreateTable
CREATE TABLE "Privmsg" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "friend1Id" INTEGER NOT NULL,
    "friend2Id" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "Privmsg_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Privmsg" ADD CONSTRAINT "Privmsg_friend1Id_fkey" FOREIGN KEY ("friend1Id") REFERENCES "Friendship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Privmsg" ADD CONSTRAINT "Privmsg_friend2Id_fkey" FOREIGN KEY ("friend2Id") REFERENCES "Friendship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Privmsg" ADD CONSTRAINT "Privmsg_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
