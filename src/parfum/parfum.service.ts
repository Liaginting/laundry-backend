
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ParfumService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number) {
    return this.prisma.parfum.findMany({
      where: { tenantId },
      orderBy: { namaParfum: 'asc' },
    });
  }

  async create(tenantId: number, namaParfum: string) {
    const nama = namaParfum?.trim();

    if (!nama) {
      throw new ForbiddenException('Nama parfum wajib diisi');
    }

    return this.prisma.parfum.create({
      data: {
        tenantId,
        namaParfum: nama,
      },
    });
  }

  async update(
    tenantId: number,
    id: number,
    namaParfum: string,
  ) {
    const parfum = await this.prisma.parfum.findFirst({
      where: { id, tenantId },
    });

    if (!parfum) {
      throw new NotFoundException('Parfum tidak ditemukan');
    }

    const nama = namaParfum?.trim();

    if (!nama) {
      throw new ForbiddenException('Nama parfum wajib diisi');
    }

    return this.prisma.parfum.update({
      where: { id },
      data: { namaParfum: nama },
    });
  }

  async remove(tenantId: number, id: number) {
    const parfum = await this.prisma.parfum.findFirst({
      where: { id, tenantId },
    });

    if (!parfum) {
      throw new NotFoundException('Parfum tidak ditemukan');
    }

    return this.prisma.parfum.delete({
      where: { id },
    });
  }
}
