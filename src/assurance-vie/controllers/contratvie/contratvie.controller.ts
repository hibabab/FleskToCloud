import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateAssureVieDto } from 'src/assurance-vie/dto/assureVie.dto';
import { CreateContratVieDto } from 'src/assurance-vie/dto/create-contrat-vie.dto';
import { CreateEmpruntDto } from 'src/assurance-vie/dto/emprunt.dto';
import { ContratvieService } from 'src/assurance-vie/services/contratvie/contratvie.service';

@Controller('contratvie')
export class ContratvieController {
    constructor(private readonly contratvieService: ContratvieService) {}

    @Post(':Cin')
    async createContratVie(
      @Param('Cin', ParseIntPipe) Cin: number,
      @Body('assureVie') assureVieDto: CreateAssureVieDto,
      @Body('contratVie') contratVieDto: CreateContratVieDto,
      @Body('emprunt') empruntDto: CreateEmpruntDto,
    ) {
      return this.contratvieService.createContratVie(Cin, assureVieDto, contratVieDto,empruntDto);
    }
    @Patch(':numero/validate')
    async validateContrat(@Param('numero') numero: number) {
      return this.contratvieService.validateContratVie(+numero);
    }
    @Get('details/:numero')
    async getContratVieDetails(@Param('numero', ParseIntPipe) numero: number) {
      return this.contratvieService.getContratVieDetails(numero);
    }
  
    @Get('par-cin/:Cin')
    async getContratsByCin(@Param('Cin', ParseIntPipe) Cin: number) {
      return this.contratvieService.getContratsByCin(Cin);
    }
  
   
}
