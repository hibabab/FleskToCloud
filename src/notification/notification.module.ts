import { forwardRef, Module } from '@nestjs/common';
import { NotificationService } from './services/notification/notification.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PaiementModule } from 'src/paiement/paiement.module';
import { AssuranceAutoModule } from 'src/assurance-auto/assurance-auto.module';
import { NotificationgatwayController } from './controllers/notification/notification.controller';

import { ContratAuto } from 'src/assurance-auto/entities/ContratAuto.entity';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TestSmsController } from './controllers/sms/TestSmsController';
import { SmsService } from './services/sms/sms.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule,
    TypeOrmModule.forFeature([NotificationEntity, ContratAuto]),
    AuthModule,
    forwardRef(() => PaiementModule),
    forwardRef(() => AssuranceAutoModule),
  ],
  providers: [
    NotificationService,
    SmsService, 
  ],
  controllers: [NotificationgatwayController, TestSmsController],
  exports: [
    TypeOrmModule, 
    NotificationService,
    SmsService, 
  ]
})
export class NotificationModule {}
