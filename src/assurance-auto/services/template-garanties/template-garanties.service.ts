import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { TemplateGaranties } from 'src/assurance-auto/entities/TemplateGaranties.entity';
import { In, Repository } from 'typeorm';

export enum TypeGaranties {
    ResponsabiliteCivile = 'ResponsabiliteCivile',
    RTI = 'RTI',
    DefenseEtRecours = 'DefenseEtRecours',
    Incendie = 'Incendie',
    Vol = 'Vol',
    PersonneTransportees = 'PersonneTransportees',
    BrisDeGlaces = 'BrisDeGlaces',
    Tierce = 'Tierce',
    AssistanceAutomobile = 'AssistanceAutomobile',
    IndividuelAccidentConducteur = 'IndividuelAccidentConducteur',
    EVENEMENTCLIMATIQUE = 'Evènements climatiques',
    GREVESEMEUTESETMOUVEMENTPOPULAIRE = 'Grèves Emeutes et Mouvements populaires',
    DOMMAGEETCOLLIDION = 'Dommage et Collision'
  }
  @Injectable()
export class TemplateGarantiesService {
  constructor(
    @InjectRepository(TemplateGaranties)
    private readonly templateGarantiesRepository: Repository<TemplateGaranties>,
  ) {}

  // Initialise les garanties par défaut si la table est vide
  async initializeDefaultGaranties() {
    const count = await this.templateGarantiesRepository.count();
    if (count > 0) return;

    const defaultGaranties = [
      { type: TypeGaranties.RTI, cotisationNette: 0 },
      { type: TypeGaranties.DefenseEtRecours, capital: 1000, cotisationNette: 50.0 },
      { type: TypeGaranties.PersonneTransportees, capital: 5000, cotisationNette: 50.0 },
      { type: TypeGaranties.AssistanceAutomobile, cotisationNette: 71.5 },
      { type: TypeGaranties.IndividuelAccidentConducteur, capital: 20000, cotisationNette: 25.0 },
      { type: TypeGaranties.EVENEMENTCLIMATIQUE, cotisationNette: 25.0 },
      { type: TypeGaranties.GREVESEMEUTESETMOUVEMENTPOPULAIRE, cotisationNette: 25.0 },
    ];

    await this.templateGarantiesRepository.save(defaultGaranties);
  }

  // Récupère toutes les garanties templates
  async findAll(): Promise<TemplateGaranties[]> {
    return this.templateGarantiesRepository.find();
  }

  async findByType(type: TypeGaranties): Promise<TemplateGaranties | null> {
    return this.templateGarantiesRepository.findOne({ where: { type } });
  }

  async updateGarantie(
    type: TypeGaranties,
    updateData: Partial<TemplateGaranties>,
  ): Promise<TemplateGaranties> {
    await this.templateGarantiesRepository.update({ type }, updateData);
    const updated = await this.findByType(type);
    if (!updated) {
      throw new NotFoundException(`TemplateGaranties with type ${type} not found after update`);
    }
    return updated;
  }

  async resetToDefaults(): Promise<void> {
    await this.templateGarantiesRepository.clear();
    await this.initializeDefaultGaranties();
  }}