import { Test, TestingModule } from '@nestjs/testing';
import { BahanLaundryService } from './bahan-laundry.service';

describe('BahanLaundryService', () => {
  let service: BahanLaundryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BahanLaundryService],
    }).compile();

    service = module.get<BahanLaundryService>(BahanLaundryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
