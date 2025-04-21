import { forwardRef, Module } from '@nestjs/common';
import { PaymentService } from './services/payment/payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { HttpModule } from '@nestjs/axios';
import { ContratAuto } from 'src/assurance-auto/entities/ContratAuto.entity';
import { AssuranceAutoModule } from 'src/assurance-auto/assurance-auto.module';
import { PaymentGatewayController } from './controllers/payment/payment.controller';

@Module({imports: [
  TypeOrmModule.forFeature([Payment, ContratAuto]), // Ajoutez ici l'entité ContratAuto
  HttpModule,
  forwardRef(() => AssuranceAutoModule), // Utilisez forwardRef pour briser la dépendance circulaire
],
providers: [PaymentService],
controllers: [PaymentGatewayController],
exports: [TypeOrmModule, PaymentService],
})
export class PaiementModule {}
