-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "namaLayanan" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "satuan" TEXT NOT NULL DEFAULT 'KG',
    "estimasiWaktu" INTEGER NOT NULL DEFAULT 2,
    "satuanWaktu" TEXT NOT NULL DEFAULT 'HARI',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
