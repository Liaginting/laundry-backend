import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    // Cari user berdasarkan email
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Jika email tidak ditemukan
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Cek password
    const passwordValid = await bcrypt.compare(password, user.password);

    // Jika password salah
    if (!passwordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    // Data yang dimasukkan ke dalam JWT
    const payload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    };

    // Buat token JWT
    const accessToken = await this.jwtService.signAsync(payload);

    // Jangan kirim password ke client
    return {
      message: 'Login berhasil',
      accessToken,
      user: {
        id: user.id,
        tenantId: user.tenantId,
        nama: user.nama,
        email: user.email,
        role: user.role,
      },
    };
  }
}