import { Body, Controller, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { TemplateGaranties } from 'src/assurance-auto/entities/TemplateGaranties.entity';
import { TypeGaranties } from 'src/assurance-auto/enums/enums';
import { TemplateGarantiesService } from 'src/assurance-auto/services/template-garanties/template-garanties.service';

@Controller('template-garanties')
export class TemplateGarantiesController {
    constructor(private readonly garantiesService: TemplateGarantiesService) {}

  // Initialisation des garanties (POST pour éviter une exécution accidentelle via GET)
  @Post('initialize')
  async initialize(): Promise<string> {
    await this.garantiesService.initializeDefaultGaranties();
    return 'Template garanties initialized successfully';
  }

  // Récupère toutes les garanties
  @Get()
  async getAll(): Promise<TemplateGaranties[]> {
    return this.garantiesService.findAll();
  }

  // Récupère une garantie spécifique
  @Get(':type')
  async getByType(@Param('type') type: TypeGaranties): Promise<TemplateGaranties> {
    const garantie = await this.garantiesService.findByType(type);
    if (!garantie) {
      throw new NotFoundException(`Garantie with type ${type} not found`);
    }
    return garantie;
  }

  // Met à jour une garantie
  @Put(':type')
  async update(
    @Param('type') type: TypeGaranties,
    @Body() updateData: Partial<TemplateGaranties>,
  ): Promise<TemplateGaranties> {
    return this.garantiesService.updateGarantie(type, updateData);
  }

 
  @Post('reset')
  async reset(): Promise<string> {
    await this.garantiesService.resetToDefaults();
    return 'Template garanties reset to default values';
  }
}
