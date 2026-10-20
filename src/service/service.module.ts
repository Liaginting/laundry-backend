import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { ServiceController } from './service.controller';
import { ServiceService } from './service.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: 'RAHASIA_JWT_LAUNDRY',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [ServiceController],
  providers: [ServiceService],
})
export class ServiceModule {}