import { Test, TestingModule } from '@nestjs/testing';
import { TemoinService } from './temoin.service';

describe('TemoinService', () => {
  let service: TemoinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TemoinService],
    }).compile();

    service = module.get<TemoinService>(TemoinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
