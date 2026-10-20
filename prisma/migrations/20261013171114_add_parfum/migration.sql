-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "parfumId" INTEGER;

-- CreateTable
CREATE TABLE "Parfum" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "namaParfum" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Parfum_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_parfumId_fkey" FOREIGN KEY ("parfumId") REFERENCES "Parfum"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Parfum" ADD CONSTRAINT "Parfum_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
