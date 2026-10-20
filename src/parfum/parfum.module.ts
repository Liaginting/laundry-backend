
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ParfumController } from './parfum.controller';
import { ParfumService } from './parfum.service';

@Module({
  imports: [JwtModule],
  controllers: [ParfumController],
  providers: [ParfumService],
})
export class ParfumModule {}
