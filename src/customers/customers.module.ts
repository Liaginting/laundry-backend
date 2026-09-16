import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: 'RAHASIA_JWT_LAUNDRY',
      signOptions: {
        expiresIn: '1d',
      },
    }),
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}