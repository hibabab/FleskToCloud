import { forwardRef, Module } from '@nestjs/common';
import { ContratvieService } from './services/contratvie/contratvie.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/paiement/entities/payment.entity';
import { ContratVie } from './entities/contrat-vie.entity';
import { AssureVie } from './entities/AssureVie.entity';
import { HttpModule } from '@nestjs/axios';
import { User } from 'src/auth/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { ContratvieController } from './controllers/contratvie/contratvie.controller';
import { AssureVieService } from './services/assure-vie/assure-vie.service';
import { AssureVieController } from './controllers/assure-vie/assure-vie.controller';
import { Emprunt } from './entities/Emprunt.entity';

@Module({imports: [
  TypeOrmModule.forFeature([Payment,ContratVie,AssureVie,User,Emprunt]), 
  HttpModule,
  AuthModule,
  forwardRef(() => Payment),
  
],
providers: [ContratvieService, AssureVieService],
controllers: [ContratvieController, AssureVieController],
exports: [TypeOrmModule,ContratvieService],
})
export class AssuranceVieModule {}
