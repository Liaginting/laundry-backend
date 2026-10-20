import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';
import { ServiceModule } from './service/service.module';
import { OrderModule } from './order/order.module';
import { ParfumModule } from './parfum/parfum.module';
import { BahanLaundryModule } from './bahan-laundry/bahan-laundry.module';

@Module({
  imports: [
    PrismaModule,
    TenantsModule,
    UsersModule,
    AuthModule,
    CustomersModule,
    ServiceModule,
    OrderModule,
    ParfumModule,
    BahanLaundryModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}