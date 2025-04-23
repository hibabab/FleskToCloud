import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { constat } from './entities/constat.entity';
import { Conducteur } from './entities/conducteur.entity';
import { Temoin } from './entities/temoin.entity';
import { AuthModule } from 'src/auth/auth.module';
import { AssuranceAutoModule } from 'src/assurance-auto/assurance-auto.module';
import { GestionUtilisateurModule } from 'src/gestion-utilisateur/gestion-utilisateur.module';
import { ConstaatService } from './services/constaat.service';

@Module({imports: [
  TypeOrmModule.forFeature([constat,Conducteur,Temoin]),
  AuthModule,
  forwardRef(() => AssuranceAutoModule),
  forwardRef(() => GestionUtilisateurModule)
],
  providers: [ConstaatService],
  controllers: [],
  exports: [TypeOrmModule,ConstaatService]
    
})
export class SinistreModule {}
