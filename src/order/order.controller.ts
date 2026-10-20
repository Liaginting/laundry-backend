import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { OrderService } from './order.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('orders')
@UseGuards(JwtGuard)
export class OrderController {
  constructor(
    private readonly orderService: OrderService,
  ) {}

  @Post()
  async createOrder(
    @Req() req: any,
    @Body() body: any,
  ) {
    const user = req.user;

    return this.orderService.createOrder(
      Number(user.tenantId),
      Number(user.sub),
      body,
    );
  }

  @Get()
  async findAll(@Req() req: any) {
    const user = req.user;

    return this.orderService.findAll(
      Number(user.tenantId),
    );
  }

  @Get(':id')
  async findOne(
    @Req() req: any,
    @Param('id') id: string,
  ) {
    const user = req.user;

    return this.orderService.findOne(
      Number(user.tenantId),
      Number(id),
    );
  }

  // ============================
  // UPDATE STATUS PESANAN
  // ============================

  @Patch(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body()
    body: {
      status: string;
    },
  ) {
    const user = req.user;

    return this.orderService.updateStatus(
      Number(user.tenantId),
      Number(id),
      body.status,
    );
  }
}