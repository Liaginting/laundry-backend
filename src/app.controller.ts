import { Controller, Get } from '@nestjs/common';

@Controller('api')
export class AppController {

  @Get()
  getApi(): string {
    return 'Backend Laundry aktif';
  }

}
