import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    tenantId: number;
    nama: string;
    email: string;
    password: string;
    role?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return this.prisma.user.create({
      data: {
        tenantId: data.tenantId,
        nama: data.nama,
        email: data.email,
        password: hashedPassword,
        role: data.role ?? 'STAFF',
      },
    });
  }

  async findAll(tenantId: number) {
    return this.prisma.user.findMany({
      where: {
        tenantId,
        role: 'STAFF',
      },
      select: {
        id: true,
        tenantId: true,
        nama: true,
        email: true,
        role: true,
        kodeKasir: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  async createCashier(
    tenantId: number,
    nama: string,
    password: string,
  ) {
    const lastCashier = await this.prisma.user.findFirst({
      where: {
        tenantId,
        role: 'STAFF',
        kodeKasir: {
          startsWith: 'KSR-',
        },
      },
      orderBy: {
        id: 'desc',
      },
    });

    let nomor = 1;

    if (lastCashier?.kodeKasir) {
      const angka = parseInt(
        lastCashier.kodeKasir.replace('KSR-', ''),
        10,
      );

      if (!isNaN(angka)) {
        nomor = angka + 1;
      }
    }

    const kodeKasir = `KSR-${String(nomor).padStart(3, '0')}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      return await this.prisma.user.create({
        data: {
          tenantId,
          nama,
          password: hashedPassword,
          role: 'STAFF',
          kodeKasir,
        },
        select: {
          id: true,
          tenantId: true,
          nama: true,
          role: true,
          kodeKasir: true,
          createdAt: true,
        },
      });
    } catch {
      throw new ConflictException('Gagal membuat akun kasir.');
    }
  }

  async updateCashier(
    tenantId: number,
    id: number,
    data: {
      nama: string;
      password?: string;
    },
  ) {
    const cashier = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId,
        role: 'STAFF',
      },
    });

    if (!cashier) {
      throw new NotFoundException('Akun kasir tidak ditemukan.');
    }

    const updateData: {
      nama: string;
      password?: string;
    } = {
      nama: data.nama.trim(),
    };

    if (data.password?.trim()) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        tenantId: true,
        nama: true,
        email: true,
        role: true,
        kodeKasir: true,
        updatedAt: true,
      },
    });
  }

  async deleteCashier(tenantId: number, id: number) {
    const cashier = await this.prisma.user.findFirst({
      where: {
        id,
        tenantId,
        role: 'STAFF',
      },
    });

    if (!cashier) {
      throw new NotFoundException('Akun kasir tidak ditemukan.');
    }

    const orderCount = await this.prisma.order.count({
      where: {
        userId: id,
        tenantId,
      },
    });

    if (orderCount > 0) {
      throw new ConflictException(
        'Akun kasir tidak dapat dihapus karena masih memiliki riwayat pesanan.',
      );
    }

    await this.prisma.user.delete({
      where: { id },
    });

    return {
      message: 'Akun kasir berhasil dihapus.',
    };
  }
}