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

  // =========================
  // LOGIN MANAGER
  // =========================
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Email atau password salah',
      );
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException(
        'Email atau password salah',
      );
    }

    const payload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      email: user.email,
    };

    const accessToken =
      await this.jwtService.signAsync(payload);

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

  // =========================
  // LOGIN KASIR
  // =========================
  async loginCashier(
    kodeKasir: string,
    password: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        kodeKasir,
      },
    });

    if (!user || user.role !== 'STAFF') {
      throw new UnauthorizedException(
        'Kode kasir atau password salah',
      );
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException(
        'Kode kasir atau password salah',
      );
    }

    const payload = {
      sub: user.id,
      tenantId: user.tenantId,
      role: user.role,
      kodeKasir: user.kodeKasir,
    };

    const accessToken =
      await this.jwtService.signAsync(payload);

    return {
      message: 'Login kasir berhasil',
      accessToken,
      user: {
        id: user.id,
        tenantId: user.tenantId,
        nama: user.nama,
        role: user.role,
        kodeKasir: user.kodeKasir,
      },
    };
  }

  // =========================
  // REGISTER LAUNDRY + MANAGER
  // =========================
  async register(data: {
    namaLaundry: string;
    alamat?: string;
    noTelepon?: string;
    namaAdmin: string;
    email: string;
    password: string;
  }) {
    const existingUser =
      await this.prisma.user.findUnique({
        where: {
          email: data.email,
        },
      });

    if (existingUser) {
      throw new UnauthorizedException(
        'Email sudah terdaftar',
      );
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      10,
    );

    const result = await this.prisma.$transaction(
      async (tx) => {
        const tenant = await tx.tenant.create({
          data: {
            namaLaundry: data.namaLaundry,
            alamat: data.alamat,
            noTelepon: data.noTelepon,
            email: data.email,
          },
        });

        const user = await tx.user.create({
          data: {
            tenantId: tenant.id,
            nama: data.namaAdmin,
            email: data.email,
            password: hashedPassword,
            role: 'ADMIN',
          },
        });

        return {
          tenant,
          user,
        };
      },
    );

    return {
      message: 'Pendaftaran laundry berhasil',
      tenant: {
        id: result.tenant.id,
        namaLaundry: result.tenant.namaLaundry,
      },
      user: {
        id: result.user.id,
        nama: result.user.nama,
        email: result.user.email,
        role: result.user.role,
      },
    };
  }
}