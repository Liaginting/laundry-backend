import { Test, TestingModule } from '@nestjs/testing';
import { ParfumService } from './parfum.service';

describe('ParfumService', () => {
  let service: ParfumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ParfumService],
    }).compile();

    service = module.get<ParfumService>(ParfumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
