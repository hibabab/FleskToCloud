import { Test, TestingModule } from '@nestjs/testing';
import { ContratvieController } from './contratvie.controller';

describe('ContratvieController', () => {
  let controller: ContratvieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContratvieController],
    }).compile();

    controller = module.get<ContratvieController>(ContratvieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
