-- CreateTable
CREATE TABLE "Tenant" (
    "id" SERIAL NOT NULL,
    "namaLaundry" TEXT NOT NULL,
    "alamat" TEXT,
    "noTelepon" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);
