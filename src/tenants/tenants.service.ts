import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenant.findMany();
  }

  async create(data: {
    namaLaundry: string;
    alamat?: string;
    noTelepon?: string;
    email?: string;
  }) {
    return this.prisma.tenant.create({
      data,
    });
  }
}