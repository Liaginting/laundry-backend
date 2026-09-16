import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CustomersService } from './customers.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('api/customers')
@UseGuards(JwtGuard)
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
  ) {}

  @Get()
  findAll(@Req() req: Request) {
    const user = (req as any).user;

    return this.customersService.findAll(user.tenantId);
  }

  @Post()
  create(
    @Req() req: Request,
    @Body()
    body: {
      nama: string;
      noTelepon: string;
      alamat?: string;
    },
  ) {
    const user = (req as any).user;

    return this.customersService.create(user.tenantId, body);
  }

  @Get(':id')
  findOne(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    const user = (req as any).user;

    return this.customersService.findOne(
      user.tenantId,
      Number(id),
    );
  }
}