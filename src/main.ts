import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { NotificationService } from './notification/services/notification/notification.service';
import * as path from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Configuration CORS
  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Configuration des fichiers statiques (uploads)
  const uploadsPath = path.join(__dirname, '..', 'upload');
  app.use('/upload', express.static(uploadsPath));

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Vérification des contrats expirants
  try {
    const notificationService = app.get(NotificationService);
    const contratsExpirants =
      await notificationService.verifierContratsExpiration(false);
    logger.log(`${contratsExpirants} contrats à vérifier`);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    logger.error('Erreur lors de la vérification des contrats', error.stack);
  }

  // Démarrage du serveur
  await app.listen(3000);
  logger.log('Serveur démarré sur http://localhost:3000');
}

bootstrap();
