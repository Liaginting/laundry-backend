import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: number) {
    return this.prisma.service.findMany({
      where: {
        tenantId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(
    tenantId: number,
    data: {
      namaLayanan: string;
      tipe?: string;
      harga: number;
      satuan?: string;
      estimasiWaktu?: number;
      satuanWaktu?: string;
    },
  ) {
    return this.prisma.service.create({
      data: {
        tenantId,
        namaLayanan: data.namaLayanan,
        tipe: data.tipe ?? 'REGULER',
        harga: data.harga,
        satuan: data.satuan ?? 'KG',
        estimasiWaktu: data.estimasiWaktu ?? 2,
        satuanWaktu: data.satuanWaktu ?? 'HARI',
      },
    });
  }

  async findOne(tenantId: number, id: number) {
    return this.prisma.service.findFirst({
      where: {
        id,
        tenantId,
      },
    });
  }

  async remove(tenantId: number, id: number) {
    const service = await this.prisma.service.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!service) {
      throw new NotFoundException(
        'Layanan tidak ditemukan',
      );
    }

    return this.prisma.service.delete({
      where: {
        id: service.id,
      },
    });
  }
}