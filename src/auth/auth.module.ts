import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailService } from '../service/mail.service';
import { VerificationmailService } from '../service/verificationmail/verificationmail.service';

import { User } from './entities/user.entity';
import { ResetToken } from './entities/ResetToken.entity';
import { Adresse } from './entities/adresse.entity';
import { Admin } from '../gestion-utilisateur/entities/admin.entity';
import { UserService } from './services/user/user.service';
import { UserGatewayController } from './controllers/user/user.controller';

@Module({
  imports: [
    // Configuration TypeORM pour les entités
    TypeOrmModule.forFeature([User, ResetToken, Adresse, Admin]),

    // Configuration du module Config
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),

    // Configuration asynchrone du JwtModule
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('PASS', '1234'), // Valeur par défaut '1234' si PASS non défini
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h') // Durée de validité du token
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController, UserGatewayController],
  providers: [
    AuthService, 
    MailService, 
    VerificationmailService, 
    UserService
  ],
  exports: [
    TypeOrmModule,
    AuthService,
    JwtModule,
    MailService
  ],
})
export class AuthModule {}