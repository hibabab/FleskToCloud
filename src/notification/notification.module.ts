import { forwardRef, Module } from '@nestjs/common';
import { NotificationService } from './services/notification/notification.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PaiementModule } from 'src/paiement/paiement.module';
import { AssuranceAutoModule } from 'src/assurance-auto/assurance-auto.module';
import { NotificationgatwayController } from './controllers/notification/notification.controller';

@Module({imports: [
  TypeOrmModule.forFeature([NotificationEntity]),
  AuthModule,
  forwardRef(() => PaiementModule),
  forwardRef(() => AssuranceAutoModule)
],
  providers: [NotificationService],
  controllers: [NotificationgatwayController],
  exports: [TypeOrmModule]
})
export class NotificationModule {}
