import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================
  // BUAT PESANAN
  // ============================================================

  async createOrder(
    tenantId: number,
    userId: number,
    data: {
      customerId: number;
      opsiPengambilan?: string;
      alamatPengantaran?: string;
      catatan?: string;
      details: {
        serviceId: number;
        jumlah: number;
      }[];
    },
  ) {
    // Cek pelanggan
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: data.customerId,
        tenantId,
      },
    });

    if (!customer) {
      throw new NotFoundException(
        'Customer tidak ditemukan',
      );
    }

    // Minimal harus ada satu layanan
    if (!data.details || data.details.length === 0) {
      throw new BadRequestException(
        'Minimal harus ada satu layanan dalam pesanan',
      );
    }

    // Ambil semua ID layanan
    const serviceIds = data.details.map(
      (detail) => detail.serviceId,
    );

    // Cari layanan berdasarkan tenant
    const services = await this.prisma.service.findMany({
      where: {
        id: {
          in: serviceIds,
        },
        tenantId,
      },
    });

    // Pastikan semua layanan ditemukan
    if (services.length !== serviceIds.length) {
      throw new BadRequestException(
        'Salah satu layanan tidak ditemukan',
      );
    }

    let totalHarga = 0;

    // Buat detail pesanan
    const orderDetails = data.details.map((detail) => {
      const service = services.find(
        (item) => item.id === detail.serviceId,
      );

      if (!service) {
        throw new BadRequestException(
          `Service ${detail.serviceId} tidak ditemukan`,
        );
      }

      // Jumlah harus lebih dari 0
      if (detail.jumlah <= 0) {
        throw new BadRequestException(
          'Jumlah layanan harus lebih dari 0',
        );
      }

      const subtotal =
        service.harga * detail.jumlah;

      totalHarga += subtotal;

      return {
        serviceId: service.id,
        jumlah: detail.jumlah,
        harga: service.harga,
        subtotal,
      };
    });

    // Generate nomor pesanan
    const nomorPesanan =
      await this.generateOrderNumber(tenantId);

    // Simpan pesanan
    const order = await this.prisma.order.create({
      data: {
        tenantId,
        customerId: data.customerId,
        userId,
        nomorPesanan,

        // Status awal
        status: 'MENUNGGU',

        opsiPengambilan:
          data.opsiPengambilan ??
          'AMBIL_SENDIRI',

        alamatPengantaran:
          data.alamatPengantaran,

        catatan: data.catatan,

        totalHarga,

        details: {
          create: orderDetails,
        },
      },

      include: {
        customer: true,

        user: {
          select: {
            id: true,
            nama: true,
            kodeKasir: true,
          },
        },

        details: {
          include: {
            service: true,
          },
        },
      },
    });

    return order;
  }

  // ============================================================
  // TAMPILKAN SEMUA PESANAN
  // ============================================================

  async findAll(tenantId: number) {
    return this.prisma.order.findMany({
      where: {
        tenantId,
      },

      include: {
        customer: true,

        user: {
          select: {
            id: true,
            nama: true,
            kodeKasir: true,
          },
        },

        details: {
          include: {
            service: true,
          },
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ============================================================
  // TAMPILKAN DETAIL PESANAN
  // ============================================================

  async findOne(
    tenantId: number,
    id: number,
  ) {
    const order =
      await this.prisma.order.findFirst({
        where: {
          id,
          tenantId,
        },

        include: {
          customer: true,

          user: {
            select: {
              id: true,
              nama: true,
              kodeKasir: true,
            },
          },

          details: {
            include: {
              service: true,
            },
          },
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Pesanan tidak ditemukan',
      );
    }

    return order;
  }

  // ============================================================
  // UPDATE STATUS PESANAN
  // ============================================================

  async updateStatus(
    tenantId: number,
    orderId: number,
    status: string,
  ) {
    // Status yang diperbolehkan
    const allowedStatuses = [
      'MENUNGGU',
      'DIPROSES',
      'SIAP_DIAMBIL',
      'SELESAI',
    ];

    // Cek apakah status valid
    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException(
        'Status pesanan tidak valid',
      );
    }

    // Cari pesanan berdasarkan ID dan tenant
    const order =
      await this.prisma.order.findFirst({
        where: {
          id: orderId,
          tenantId,
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Pesanan tidak ditemukan',
      );
    }

    // Status pesanan saat ini
    const currentStatus = order.status;

    // Alur perubahan status
    const statusFlow: Record<
      string,
      string[]
    > = {
      MENUNGGU: ['DIPROSES'],

      DIPROSES: ['SIAP_DIAMBIL'],

      SIAP_DIAMBIL: ['SELESAI'],

      SELESAI: [],
    };

    // Status berikutnya yang diperbolehkan
    const nextStatuses =
      statusFlow[currentStatus] ?? [];

    // Cek apakah perubahan status sesuai alur
    if (!nextStatuses.includes(status)) {
      throw new BadRequestException(
        `Pesanan dengan status ${currentStatus} tidak dapat diubah menjadi ${status}`,
      );
    }

    // Update status
    const updatedOrder =
      await this.prisma.order.update({
        where: {
          id: orderId,
        },

        data: {
          status,
        },

        include: {
          customer: true,

          user: {
            select: {
              id: true,
              nama: true,
              kodeKasir: true,
            },
          },

          details: {
            include: {
              service: true,
            },
          },
        },
      });

    return updatedOrder;
  }

  // ============================================================
  // GENERATE NOMOR PESANAN
  // ============================================================

  private async generateOrderNumber(
    tenantId: number,
  ): Promise<string> {
    const count =
      await this.prisma.order.count({
        where: {
          tenantId,
        },
      });

    const nextNumber = count + 1;

    return `ORD-${String(nextNumber).padStart(
      4,
      '0',
    )}`;
  }
}