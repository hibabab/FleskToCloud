import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';

import { MailService } from './service/mail.service';
import { AssuranceAutoModule } from './assurance-auto/assurance-auto.module';
import { PaiementModule } from './paiement/paiement.module';
import { NotificationModule } from './notification/notification.module';
import { GestionUtilisateurModule } from './gestion-utilisateur/gestion-utilisateur.module';
import { SinistreModule } from './sinistre/sinistre.module';
import { AssuranceVieModule } from './assurance-vie/assurance-vie.module';
import { ContratvieService } from './assurance-vie/services/contratvie/contratvie.service';


@Module({
  imports: [
    // Load environment variables from .env file
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configure JWT module asynchronously
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('PASS'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),

    // Configure TypeORM module asynchronously
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const dbPassword = configService.get<string>('DB_PASSWORD');
        console.log('Database Password:', dbPassword, typeof dbPassword); // Debugging

        if (!dbPassword || typeof dbPassword !== 'string') {
          throw new Error('Database password is missing or invalid.');
        }

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USER'),
          password: dbPassword,
          database: configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          synchronize: true, // ⚠️ Disable in production
        };
      },
      inject: [ConfigService],
    }),

    // Import feature modules
    AuthModule,

    AssuranceAutoModule,

    PaiementModule,

    NotificationModule,

    GestionUtilisateurModule,

    SinistreModule,

    AssuranceVieModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService, ContratvieService],
})
export class AppModule {}
