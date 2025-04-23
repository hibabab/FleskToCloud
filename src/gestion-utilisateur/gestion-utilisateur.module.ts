import { forwardRef, Module } from '@nestjs/common';
import { ExpertService } from './services/expert/expert.service';
import { AgentServiceService } from './services/agent-service/agent-service.service';
import { AgentServiceController } from './controllers/agent-service/agent-service.controller';
import { ExpertController } from './controllers/expert/expert.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { SinistreModule } from 'src/sinistre/sinistre.module';
import { PaiementModule } from 'src/paiement/paiement.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ContratAuto } from 'src/assurance-auto/entities/ContratAuto.entity';
import { Garanties } from 'src/assurance-auto/entities/Garanties.entity';
import { Vehicule } from 'src/assurance-auto/entities/Vehicule.entity';
import { Assure } from 'src/assurance-auto/entities/assure.entity';
import { TemplateGaranties } from 'src/assurance-auto/entities/TemplateGaranties.entity';
import { CarteGrise } from 'src/assurance-auto/entities/carte-grise.entity';
import { Expert } from './entities/Expert.entity';
import { AgentService } from './entities/AgentService.entity';
import { User } from 'src/auth/entities/user.entity';
import { Payment } from 'src/paiement/entities/payment.entity';
import { NotificationEntity } from 'src/notification/entities/notification.entity';
import { AdminService } from './services/admin/admin.service';
import { AdminController } from './controllers/admin/admin.controller';

@Module({imports: [
    TypeOrmModule.forFeature([ContratAuto, Garanties, Vehicule, Assure, TemplateGaranties,CarteGrise,Expert,AgentService,User,Payment,NotificationEntity]),
    AuthModule,
    PaiementModule,
    forwardRef(() => NotificationModule),
    SinistreModule,],
  providers: [ExpertService, AgentServiceService,AdminService],
  controllers: [AgentServiceController, ExpertController,AdminController],
  exports: [TypeOrmModule,ExpertService,AgentServiceService]
})
export class GestionUtilisateurModule {}
