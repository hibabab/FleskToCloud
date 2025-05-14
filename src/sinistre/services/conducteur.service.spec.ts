import { Test, TestingModule } from '@nestjs/testing';
import { ConducteurService } from './conducteur.service';

describe('ConducteurService', () => {
  let service: ConducteurService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConducteurService],
    }).compile();

    service = module.get<ConducteurService>(ConducteurService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
