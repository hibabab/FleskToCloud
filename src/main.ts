import { NestFactory } from '@nestjs/core'; // Importation de NestFactory pour créer l'application Nest
import { AppModule } from './app.module'; // Importation du module principal de l'application
import { ValidationPipe } from '@nestjs/common'; // Importation du ValidationPipe
import { Logger } from '@nestjs/common'; // Importation du Logger pour ajouter des logs
import { NotificationService } from './notification/services/notification/notification.service';

async function bootstrap() {
  // Création de l'application NestJS normale
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: 'http://localhost:4200', // Your Angular app's origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // If you need to pass cookies/authentication
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  // Utilisation du ValidationPipe globalement pour valider les requêtes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Rejette la requête si des propriétés non définies sont présentes
    }),
  );
  const notificationService = app.get(NotificationService);

  await app.listen(3000);
  Logger.log('Application started on port 3000', 'Bootstrap'); // Log lorsque l'application commence à écouter
  try {
    logger.log('Vérification des contrats en expiration au démarrage (sans envoi de notifications)...');
    // Passer false pour ne pas envoyer de notifications au démarrage
    const contratsExpirants = await notificationService.verifierContratsExpiration(false);
    logger.log(`Vérification terminée. ${contratsExpirants} contrats expirent dans les 14 prochains jours.`);
  } catch (error) {
    logger.error('Erreur lors de la vérification des contrats en expiration', error.stack);
  }
}

// Appelle la fonction bootstrap pour lancer l'application
bootstrap();
