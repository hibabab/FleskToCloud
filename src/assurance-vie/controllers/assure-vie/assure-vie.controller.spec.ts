import { Test, TestingModule } from '@nestjs/testing';
import { AssureVieController } from './assure-vie.controller';

describe('AssureVieController', () => {
  let controller: AssureVieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssureVieController],
    }).compile();

    controller = module.get<AssureVieController>(AssureVieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
