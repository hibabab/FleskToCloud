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

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ResetToken, Adresse]),

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        secret: configService.get<string>('PASS'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, VerificationmailService],
  exports: [AuthService, TypeOrmModule, JwtModule, MailService],
})
export class AuthModule {}
