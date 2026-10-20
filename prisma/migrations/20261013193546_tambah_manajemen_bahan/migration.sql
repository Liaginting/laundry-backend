-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "beratKg" DOUBLE PRECISION,
ADD COLUMN     "stokBahanDikurangiAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "BahanLaundry" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "stokMl" INTEGER NOT NULL DEFAULT 0,
    "takaranPerKgMl" INTEGER NOT NULL DEFAULT 0,
    "batasMinimumMl" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BahanLaundry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiwayatStokBahan" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "bahanId" INTEGER NOT NULL,
    "orderId" INTEGER,
    "jenis" TEXT NOT NULL,
    "jumlahMl" INTEGER NOT NULL,
    "stokSebelumMl" INTEGER NOT NULL,
    "stokSesudahMl" INTEGER NOT NULL,
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiwayatStokBahan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BahanLaundry_tenantId_kategori_idx" ON "BahanLaundry"("tenantId", "kategori");

-- CreateIndex
CREATE INDEX "RiwayatStokBahan_tenantId_createdAt_idx" ON "RiwayatStokBahan"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "RiwayatStokBahan_orderId_idx" ON "RiwayatStokBahan"("orderId");

-- AddForeignKey
ALTER TABLE "BahanLaundry" ADD CONSTRAINT "BahanLaundry_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiwayatStokBahan" ADD CONSTRAINT "RiwayatStokBahan_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiwayatStokBahan" ADD CONSTRAINT "RiwayatStokBahan_bahanId_fkey" FOREIGN KEY ("bahanId") REFERENCES "BahanLaundry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiwayatStokBahan" ADD CONSTRAINT "RiwayatStokBahan_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;
