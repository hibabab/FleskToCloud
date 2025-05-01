import { Test, TestingModule } from '@nestjs/testing';
import { AssureVieService } from './assure-vie.service';

describe('AssureVieService', () => {
  let service: AssureVieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssureVieService],
    }).compile();

    service = module.get<AssureVieService>(AssureVieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
