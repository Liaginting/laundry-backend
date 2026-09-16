import { Body, Controller, Get, Post } from '@nestjs/common';
import { TenantsService } from './tenants.service';

@Controller('api/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  @Post()
  create(@Body() body: {
    namaLaundry: string;
    alamat?: string;
    noTelepon?: string;
    email?: string;
  }) {
    return this.tenantsService.create(body);
  }
}