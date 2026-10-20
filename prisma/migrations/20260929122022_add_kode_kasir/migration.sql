/*
  Warnings:

  - A unique constraint covering the columns `[kodeKasir]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "kodeKasir" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_kodeKasir_key" ON "User"("kodeKasir");
