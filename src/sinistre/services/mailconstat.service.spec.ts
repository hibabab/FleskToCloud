import { Test, TestingModule } from '@nestjs/testing';
import { MailconstatService } from './mailconstat.service';

describe('MailconstatService', () => {
  let service: MailconstatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailconstatService],
    }).compile();

    service = module.get<MailconstatService>(MailconstatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
