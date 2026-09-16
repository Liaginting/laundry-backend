import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtGuard } from '../auth/jwt/jwt.guard';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtGuard)
  findAll() {
    return this.usersService.findAll();
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
}