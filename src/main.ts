import { NestFactory } from '@nestjs/core'; // Importation de NestFactory pour créer l'application Nest
import { AppModule } from './app.module'; // Importation du module principal de l'application
import { ValidationPipe } from '@nestjs/common'; // Importation du ValidationPipe
import { Logger } from '@nestjs/common'; // Importation du Logger pour ajouter des logs

async function bootstrap() {
  // Création de l'application NestJS normale
  const app = await NestFactory.create(AppModule);

  // Utilisation du ValidationPipe globalement pour valider les requêtes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Rejette la requête si des propriétés non définies sont présentes
    }),
  );

  // Démarrage de l'application sur le port 3000
  await app.listen(3000);
  Logger.log('Application started on port 3000', 'Bootstrap'); // Log lorsque l'application commence à écouter
}

// Appelle la fonction bootstrap pour lancer l'application
bootstrap();
