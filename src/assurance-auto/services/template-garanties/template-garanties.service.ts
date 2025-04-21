import { Injectable } from '@nestjs/common';

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
      private readonly templateRepo: Repository<TemplateGaranties>
    ) {}
  
    private roundToThree(value: number): number {
      return Math.round(value * 1000) / 1000;
    }
  
    async initializeDefaultTemplates(): Promise<{success: boolean, count: number}> {
      const defaultTemplates = [
        // Pack1 + Base
        {
          type: TypeGaranties.RTI,
          capital: null,
          franchise: null,
          cotisationNette: this.roundToThree(0)
        },
        {
          type: TypeGaranties.DefenseEtRecours,
          capital: this.roundToThree(1000),
          franchise: null,
          cotisationNette: this.roundToThree(50)
        },
        {
          type: TypeGaranties.PersonneTransportees,
          capital: this.roundToThree(5000),
          franchise: null,
          cotisationNette: this.roundToThree(50)
        },
        {
          type: TypeGaranties.AssistanceAutomobile,
          capital: null,
          franchise: null,
          cotisationNette: this.roundToThree(71.5)
        },
        {
          type: TypeGaranties.IndividuelAccidentConducteur,
          capital: this.roundToThree(20000),
          franchise: null,
          cotisationNette: this.roundToThree(25)
        },
        // Pack2 + Pack3
        {
          type: TypeGaranties.EVENEMENTCLIMATIQUE,
          capital: null,
          franchise: null,
          cotisationNette: this.roundToThree(25)
        },
        {
          type: TypeGaranties.GREVESEMEUTESETMOUVEMENTPOPULAIRE,
          capital: null,
          franchise: null,
          cotisationNette: this.roundToThree(25)
        }
      ];
  
      try {
        const results = await Promise.all(
          defaultTemplates.map(template => 
            this.templateRepo.save(this.templateRepo.create(template)))
        );
        return { success: true, count: results.length };
      } catch (error) {
        console.error('Error initializing templates:', error);
        return { success: false, count: 0 };
      }
    }
  
    async getTemplatesForPack(pack: string): Promise<TemplateGaranties[]> {
      const packMappings = {
        Pack1: [
          TypeGaranties.RTI,
          TypeGaranties.DefenseEtRecours,
          TypeGaranties.PersonneTransportees,
          TypeGaranties.AssistanceAutomobile,
          TypeGaranties.IndividuelAccidentConducteur
        ],
        Pack2: [
          TypeGaranties.RTI,
          TypeGaranties.DefenseEtRecours,
          TypeGaranties.PersonneTransportees,
          TypeGaranties.AssistanceAutomobile,
          TypeGaranties.IndividuelAccidentConducteur,
          TypeGaranties.EVENEMENTCLIMATIQUE,
          TypeGaranties.GREVESEMEUTESETMOUVEMENTPOPULAIRE
        ],
        Pack3: [
          TypeGaranties.RTI,
          TypeGaranties.DefenseEtRecours,
          TypeGaranties.PersonneTransportees,
          TypeGaranties.AssistanceAutomobile,
          TypeGaranties.IndividuelAccidentConducteur,
          TypeGaranties.EVENEMENTCLIMATIQUE,
          TypeGaranties.GREVESEMEUTESETMOUVEMENTPOPULAIRE,
        ]
      };
  
      const types = packMappings[pack] || packMappings.Pack1;
      return this.templateRepo.find({ 
        where: { type: In(types) },
        order: { type: 'ASC' }
      });
    }
  
    async getAllTemplates(): Promise<TemplateGaranties[]> {
      return this.templateRepo.find({ order: { type: 'ASC' } });
    }
  }