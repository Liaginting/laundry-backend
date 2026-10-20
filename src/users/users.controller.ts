import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import type { Request } from 'express';

import { UsersService } from './users.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';

@Controller('api/users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  findAll(@Req() req: Request) {
    const user = (req as any).user;

    return this.usersService.findAll(Number(user.tenantId));
  }

  @Post('register')
  create(
    @Body()
    body: {
      tenantId: number;
      nama: string;
      email: string;
      password: string;
      role?: string;
    },
  ) {
    return this.usersService.create(body);
  }

  @Post('cashier')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  createCashier(
    @Req() req: Request,
    @Body()
    body: {
      nama: string;
      password: string;
    },
  ) {
    const user = (req as any).user;

    return this.usersService.createCashier(
      Number(user.tenantId),
      body.nama,
      body.password,
    );
  }

  @Patch('cashier/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  updateCashier(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body()
    body: {
      nama: string;
      password?: string;
    },
  ) {
    const user = (req as any).user;

    return this.usersService.updateCashier(
      Number(user.tenantId),
      id,
      body,
    );
  }

  @Delete('cashier/:id')
  @UseGuards(JwtGuard, RolesGuard)
  @Roles('ADMIN')
  deleteCashier(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const user = (req as any).user;

    return this.usersService.deleteCashier(
      Number(user.tenantId),
      id,
    );
  }
}