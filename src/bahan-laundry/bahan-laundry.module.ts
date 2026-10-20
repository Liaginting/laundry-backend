
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BahanLaundryService } from './bahan-laundry.service';
import { BahanLaundryController } from './bahan-laundry.controller';

@Module({
  imports: [AuthModule],
  controllers: [BahanLaundryController],
  providers: [BahanLaundryService],
  exports: [BahanLaundryService],
})
export class BahanLaundryModule {}
