-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_parfumId_fkey";

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_parfumId_fkey" FOREIGN KEY ("parfumId") REFERENCES "BahanLaundry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
