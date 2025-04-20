import { Test, TestingModule } from '@nestjs/testing';
import { VerificationmailService } from './verificationmail.service';

describe('VerificationmailService', () => {
  let service: VerificationmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerificationmailService],
    }).compile();

    service = module.get<VerificationmailService>(VerificationmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
