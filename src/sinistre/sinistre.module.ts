import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { constat } from './entities/constat.entity';
import { Conducteur } from './entities/conducteur.entity';
import { Temoin } from './entities/temoin.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AssuranceAutoModule } from 'src/assurance-auto/assurance-auto.module';
import { GestionUtilisateurModule } from 'src/gestion-utilisateur/gestion-utilisateur.module';
import { TemoinService } from './services/temoin.service';
import { ConducteurService } from './services/conducteur.service';
import { AdresseService } from './services/adresse-service.service';
import { Adresse } from 'src/auth/entities/adresse.entity';
import { AgentService } from 'src/gestion-utilisateur/entities/AgentService.entity';
import { Expert } from 'src/gestion-utilisateur/entities/Expert.entity';
import { User } from 'src/auth/entities/user.entity';

import { VehiculeService } from 'src/assurance-auto/services/vehicule/vehicule.service';
import { NotificationService } from 'src/notification/services/notification/notification.service';
import { ExpertService } from 'src/gestion-utilisateur/services/expert/expert.service';
import { AgentServiceService } from 'src/gestion-utilisateur/services/agent-service/agent-service.service';
import { AssureService } from 'src/assurance-auto/services/assure/assure.service';
import { ConstatService } from './services/constaat.service';
import { Assure } from 'src/assurance-auto/entities/assure.entity';
import { Vehicule } from 'src/assurance-auto/entities/Vehicule.entity';
import { ContratAuto } from 'src/assurance-auto/entities/ContratAuto.entity';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { MailConstatService } from './services/mailconstat.service';
import { ConstatController } from './Controller/sinistre.controller';
import { UserService } from 'src/auth/services/user/user.service';
import { SmsService } from 'src/notification/services/sms/sms.service';

import { PhotoJustificatif } from './entities/photo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContratAuto,
      Conducteur,
      Temoin,
      Assure,
      Vehicule,
      User,
      Adresse,
      constat,
      Expert,
      NotificationEntity,
      AgentService,
      PhotoJustificatif,
    ]),
    AuthModule,
    forwardRef(() => AssuranceAutoModule),
    forwardRef(() => GestionUtilisateurModule),
  ],

  controllers: [ConstatController],
  providers: [
    // Définition des services qui seront utilisés dans ce module
    ConducteurService,
    AssureService,
    VehiculeService,
    TemoinService,
    AdresseService,
    UserService,
    MailConstatService,
    NotificationService,
    ExpertService,
    AgentServiceService,
    ConstatService,
    SmsService,
  ],
})
export class SinistreModule {}
