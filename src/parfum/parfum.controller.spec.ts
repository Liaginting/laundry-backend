import { Test, TestingModule } from '@nestjs/testing';
import { ParfumController } from './parfum.controller';

describe('ParfumController', () => {
  let controller: ParfumController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParfumController],
    }).compile();

    controller = module.get<ParfumController>(ParfumController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
