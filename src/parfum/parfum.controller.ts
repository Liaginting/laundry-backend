
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { ParfumService } from './parfum.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';

interface AuthenticatedRequest extends Request {
  user: {
    sub: number;
    tenantId: number;
    role: string;
  };
}

@Controller('parfum')
@UseGuards(JwtGuard)
export class ParfumController {
  constructor(
    private readonly parfumService: ParfumService,
  ) {}

  // Admin dan Kasir boleh melihat daftar parfum
  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.parfumService.findAll(
      Number(req.user.tenantId),
    );
  }

  // Hanya Admin yang boleh menambahkan parfum
  @Post()
  create(
    @Req() req: AuthenticatedRequest,
    @Body('namaParfum') namaParfum: string,
  ) {
    this.checkAdmin(req.user.role);

    return this.parfumService.create(
      Number(req.user.tenantId),
      namaParfum,
    );
  }

  // Hanya Admin yang boleh mengedit parfum
  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body('namaParfum') namaParfum: string,
  ) {
    this.checkAdmin(req.user.role);

    return this.parfumService.update(
      Number(req.user.tenantId),
      id,
      namaParfum,
    );
  }

  // Hanya Admin yang boleh menghapus parfum
  @Delete(':id')
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    this.checkAdmin(req.user.role);

    return this.parfumService.remove(
      Number(req.user.tenantId),
      id,
    );
  }

  private checkAdmin(role: string) {
    if (role !== 'ADMIN') {
      throw new ForbiddenException(
        'Hanya Admin yang boleh mengelola parfum',
      );
    }
  }
}
