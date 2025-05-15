import { Controller, Get, Param } from "@nestjs/common";
import { AssureService } from "src/assurance-auto/services/assure/assure.service";

@Controller('assures')
export class AssureController {
  constructor(private readonly assureService: AssureService) {}

  @Get('by-cin/:cin')
  async getByCin(@Param('cin') cin: number) {
    return this.assureService.getAssureByCin(cin);
  }
  @Get('count')
async getAssuresCount(): Promise<number> {
    return this.assureService.getAssuresCount();
}
}