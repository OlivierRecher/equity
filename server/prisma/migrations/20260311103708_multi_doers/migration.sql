/*
  Warnings:

  - You are about to drop the column `userId` on the `Task` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "TaskDoer" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TaskDoer_pkey" PRIMARY KEY ("id")
);

-- MIGRATE EXISTING DATA
INSERT INTO "TaskDoer" ("id", "taskId", "userId")
SELECT gen_random_uuid()::text, "id", "userId" FROM "Task" WHERE "userId" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "Task" DROP CONSTRAINT "Task_userId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "userId";

-- CreateIndex
CREATE UNIQUE INDEX "TaskDoer_taskId_userId_key" ON "TaskDoer"("taskId", "userId");

-- AddForeignKey
ALTER TABLE "TaskDoer" ADD CONSTRAINT "TaskDoer_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskDoer" ADD CONSTRAINT "TaskDoer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
