import { Test, TestingModule } from '@nestjs/testing';
import { ContratvieService } from './contratvie.service';

describe('ContratvieService', () => {
  let service: ContratvieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContratvieService],
    }).compile();

    service = module.get<ContratvieService>(ContratvieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
