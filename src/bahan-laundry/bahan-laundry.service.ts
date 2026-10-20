
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BahanLaundryService {
  constructor(private readonly prisma: PrismaService) {}

  // Menampilkan bahan milik tenant yang sedang login
  async findAll(tenantId: number) {
    return this.prisma.bahanLaundry.findMany({
      where: { tenantId },
      orderBy: [{ kategori: 'asc' }, { nama: 'asc' }],
    });
  }

  // Menambahkan bahan baru
  async create(
    tenantId: number,
    data: {
      nama: string;
      kategori: string;
      stokMl?: number;
      takaranPerKgMl: number;
      batasMinimumMl: number;
    },
  ) {
    const nama = data.nama?.trim();
    const kategori = data.kategori?.toUpperCase();

    if (!nama) {
      throw new BadRequestException('Nama bahan wajib diisi');
    }

    if (!['DETERJEN', 'PARFUM', 'PELEMBUT'].includes(kategori)) {
      throw new BadRequestException(
        'Kategori harus DETERJEN, PARFUM, atau PELEMBUT',
      );
    }

    const stokMl = data.stokMl ?? 0;

    if (
      !Number.isInteger(stokMl) ||
      !Number.isInteger(data.takaranPerKgMl) ||
      !Number.isInteger(data.batasMinimumMl) ||
      stokMl < 0 ||
      data.takaranPerKgMl < 0 ||
      data.batasMinimumMl < 0
    ) {
      throw new BadRequestException(
        'Stok, takaran, dan batas minimum harus berupa bilangan bulat nonnegatif',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const bahan = await tx.bahanLaundry.create({
        data: {
          tenantId,
          nama,
          kategori,
          stokMl: 0,
          takaranPerKgMl: data.takaranPerKgMl,
          batasMinimumMl: data.batasMinimumMl,
        },
      });

      // Jika stok awal diisi, catat sebagai stok masuk
      if (stokMl > 0) {
        return tx.bahanLaundry.update({
          where: { id: bahan.id },
          data: {
            stokMl,
            riwayat: {
              create: {
                tenantId,
                jenis: 'MASUK',
                jumlahMl: stokMl,
                stokSebelumMl: 0,
                stokSesudahMl: stokMl,
                catatan: 'Stok awal bahan',
              },
            },
          },
        });
      }

      return bahan;
    });
  }

  // Mengubah informasi bahan
  async update(
    tenantId: number,
    id: number,
    data: {
      nama?: string;
      kategori?: string;
      takaranPerKgMl?: number;
      batasMinimumMl?: number;
    },
  ) {
    const bahan = await this.prisma.bahanLaundry.findFirst({
      where: { id, tenantId },
    });

    if (!bahan) {
      throw new NotFoundException('Bahan laundry tidak ditemukan');
    }

    const updateData: {
      nama?: string;
      kategori?: string;
      takaranPerKgMl?: number;
      batasMinimumMl?: number;
    } = {};

    if (data.nama !== undefined) {
      if (!data.nama.trim()) {
        throw new BadRequestException('Nama bahan tidak boleh kosong');
      }
      updateData.nama = data.nama.trim();
    }

    if (data.kategori !== undefined) {
      const kategori = data.kategori.toUpperCase();

      if (!['DETERJEN', 'PARFUM', 'PELEMBUT'].includes(kategori)) {
        throw new BadRequestException('Kategori bahan tidak valid');
      }

      updateData.kategori = kategori;
    }

    for (const field of [
      'takaranPerKgMl',
      'batasMinimumMl',
    ] as const) {
      const value = data[field];

      if (value !== undefined) {
        if (!Number.isInteger(value) || value < 0) {
          throw new BadRequestException(
            `${field} harus berupa bilangan bulat nonnegatif`,
          );
        }

        updateData[field] = value;
      }
    }

    return this.prisma.bahanLaundry.update({
      where: { id },
      data: updateData,
    });
  }

  // Menambahkan stok dan mencatat riwayatnya
  async tambahStok(
    tenantId: number,
    id: number,
    jumlahMl: number,
    catatan?: string,
  ) {
    if (!Number.isInteger(jumlahMl) || jumlahMl <= 0) {
      throw new BadRequestException(
        'Jumlah stok masuk harus berupa bilangan bulat lebih dari 0',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const bahan = await tx.bahanLaundry.findFirst({
        where: { id, tenantId },
      });

      if (!bahan) {
        throw new NotFoundException('Bahan laundry tidak ditemukan');
      }

      const stokSebelumMl = bahan.stokMl;
      const stokSesudahMl = stokSebelumMl + jumlahMl;

      const hasil = await tx.bahanLaundry.update({
        where: { id },
        data: {
          stokMl: stokSesudahMl,
          riwayat: {
            create: {
              tenantId,
              jenis: 'MASUK',
              jumlahMl,
              stokSebelumMl,
              stokSesudahMl,
              catatan: catatan?.trim() || 'Penambahan stok',
            },
          },
        },
      });

      return hasil;
    });
  }

  // Melihat riwayat stok bahan tertentu
  async riwayatStok(tenantId: number, id: number) {
    const bahan = await this.prisma.bahanLaundry.findFirst({
      where: { id, tenantId },
    });

    if (!bahan) {
      throw new NotFoundException('Bahan laundry tidak ditemukan');
    }

    return this.prisma.riwayatStokBahan.findMany({
      where: { tenantId, bahanId: id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
