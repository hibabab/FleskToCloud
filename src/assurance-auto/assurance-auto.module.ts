import { forwardRef, Module } from '@nestjs/common';
import { ContratAutoService } from './services/contrat-auto/contrat-auto.service';
import { GarantiesService } from './services/garanties/garanties.service';
import { VehiculeService } from './services/vehicule/vehicule.service';
import { AssureService } from './services/assure/assure.service';
import { ContratAutoController } from './controllers/contrat-auto/contrat-auto.controller';
import { GarantiesController } from './controllers/garanties/garanties.controller';
import { VehiculeController } from './controllers/vehicule/vehicule.controller';
import { AssureController } from './controllers/assure/assure.controller';
import { TemplateGarantiesService } from './services/template-garanties/template-garanties.service';
import { TemplateGarantiesController } from './controllers/template-garanties/template-garanties.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContratAuto } from './entities/ContratAuto.entity';
import { Garanties } from './entities/Garanties.entity';
import { Vehicule } from './entities/Vehicule.entity';
import { Assure } from './entities/assure.entity';
import { TemplateGaranties } from './entities/TemplateGaranties.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PaiementModule } from 'src/paiement/paiement.module';
import { CarteGrise } from './entities/carte-grise.entity';
import { Expert } from 'src/gestion-utilisateur/entities/Expert.entity';
import { AgentService } from 'src/gestion-utilisateur/entities/AgentService.entity';
import { User } from 'src/auth/entities/user.entity';
import { GestionUtilisateurModule } from 'src/gestion-utilisateur/gestion-utilisateur.module';
import { SinistreModule } from 'src/sinistre/sinistre.module';


@Module(
  {imports: [
    TypeOrmModule.forFeature([ContratAuto, Garanties, Vehicule, Assure, TemplateGaranties,CarteGrise,Expert,AgentService,User]),
    AuthModule,
    SinistreModule,
    forwardRef(() => PaiementModule), 
    forwardRef(() => GestionUtilisateurModule),
  ],
  providers: [ContratAutoService, GarantiesService, VehiculeService, AssureService, TemplateGarantiesService,],
  controllers: [ContratAutoController, GarantiesController, VehiculeController, AssureController, TemplateGarantiesController],
  exports: [TypeOrmModule, ContratAutoService], 
})
export class AssuranceAutoModule {}
