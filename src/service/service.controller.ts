import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { ServiceService } from './service.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('api/services')
@UseGuards(JwtGuard)
export class ServiceController {
  constructor(
    private readonly serviceService: ServiceService,
  ) {}

  // =========================
  // GET SEMUA LAYANAN
  // =========================
  @Get()
  findAll(@Req() req: Request) {
    const user = (req as any).user;

    return this.serviceService.findAll(
      user.tenantId,
    );
  }

  // =========================
  // TAMBAH LAYANAN
  // =========================
  @Post()
  create(
    @Req() req: Request,
    @Body()
    body: {
      namaLayanan: string;
      tipe?: string;
      harga: number;
      satuan?: string;
      estimasiWaktu?: number;
      satuanWaktu?: string;
    },
  ) {
    const user = (req as any).user;

    return this.serviceService.create(
      user.tenantId,
      body,
    );
  }

  // =========================
  // GET LAYANAN BERDASARKAN ID
  // =========================
  @Get(':id')
  findOne(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    const user = (req as any).user;

    return this.serviceService.findOne(
      user.tenantId,
      Number(id),
    );
  }

  // =========================
  // HAPUS LAYANAN
  // =========================
  @Delete(':id')
  remove(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    const user = (req as any).user;

    return this.serviceService.remove(
      user.tenantId,
      Number(id),
    );
  }
}