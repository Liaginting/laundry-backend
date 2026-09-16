import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(tenantId: number) {
    return this.prisma.customer.findMany({
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
      nama: string;
      noTelepon: string;
      alamat?: string;
    },
  ) {
    return this.prisma.customer.create({
      data: {
        tenantId,
        nama: data.nama,
        noTelepon: data.noTelepon,
        alamat: data.alamat,
      },
    });
  }

  async findOne(tenantId: number, id: number) {
    return this.prisma.customer.findFirst({
      where: {
        id,
        tenantId,
      },
    });
  }
}