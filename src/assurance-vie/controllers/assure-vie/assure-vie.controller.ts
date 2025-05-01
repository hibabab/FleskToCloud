import { Controller, Get, Query } from '@nestjs/common';
import { AssureVieService } from 'src/assurance-vie/services/assure-vie/assure-vie.service';

@Controller('assure-vie')
export class AssureVieController {
      constructor(private readonly assureVieService: AssureVieService) {}
    @Get('assures')
    async getAllAssuresVie() {
      return this.assureVieService.getAllAssuresVie();
    }
    @Get('search')
    async searchAssuresVie(@Query('cin') cin: string) {
      if (cin) {
        return this.assureVieService.searchAssuresByCin(cin);
      }
      return this.assureVieService.getAllAssuresVie();
    }
}
