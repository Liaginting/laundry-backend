import { Injectable } from '@nestjs/common';
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
    // Enkripsi password sebelum disimpan ke database
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

  async findAll() {
    // Password tidak dikirim dalam response
    return this.prisma.user.findMany({
      select: {
        id: true,
        tenantId: true,
        nama: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}