
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { BahanLaundryService } from './bahan-laundry.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';

interface RequestWithUser extends Request {
  user: {
    tenantId: number;
    role: string;
  };
}

@Controller('bahan-laundry')
@UseGuards(JwtGuard, RolesGuard)
export class BahanLaundryController {
  constructor(
    private readonly bahanLaundryService: BahanLaundryService,
  ) {}

  // Daftar bahan dapat dilihat admin dan kasir
  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.bahanLaundryService.findAll(
      Number(req.user.tenantId),
    );
  }

  // Menambahkan bahan hanya untuk admin
  @Post()
  @Roles('ADMIN')
  create(
    @Req() req: RequestWithUser,
    @Body()
    body: {
      nama: string;
      kategori: string;
      stokMl?: number;
      takaranPerKgMl: number;
      batasMinimumMl: number;
    },
  ) {
    return this.bahanLaundryService.create(
      Number(req.user.tenantId),
      body,
    );
  }

  // Mengubah informasi bahan hanya untuk admin
  @Patch(':id')
  @Roles('ADMIN')
  update(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      nama?: string;
      kategori?: string;
      takaranPerKgMl?: number;
      batasMinimumMl?: number;
    },
  ) {
    return this.bahanLaundryService.update(
      Number(req.user.tenantId),
      id,
      body,
    );
  }

  // Menambah stok hanya untuk admin
  @Post(':id/stok')
  @Roles('ADMIN')
  tambahStok(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { jumlahMl: number; catatan?: string },
  ) {
    return this.bahanLaundryService.tambahStok(
      Number(req.user.tenantId),
      id,
      body.jumlahMl,
      body.catatan,
    );
  }

  // Melihat riwayat stok
  @Get(':id/riwayat')
  riwayatStok(
    @Req() req: RequestWithUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.bahanLaundryService.riwayatStok(
      Number(req.user.tenantId),
      id,
    );
  }
}
