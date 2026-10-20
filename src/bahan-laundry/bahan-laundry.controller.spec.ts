import { Test, TestingModule } from '@nestjs/testing';
import { BahanLaundryController } from './bahan-laundry.controller';

describe('BahanLaundryController', () => {
  let controller: BahanLaundryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BahanLaundryController],
    }).compile();

    controller = module.get<BahanLaundryController>(BahanLaundryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
