import { NestFactory } from '@nestjs/core'; // Importation de NestFactory pour créer l'application Nest
import { AppModule } from './app.module'; // Importation du module principal de l'application
import { ValidationPipe } from '@nestjs/common'; // Importation du ValidationPipe
import { Logger } from '@nestjs/common'; // Importation du Logger pour ajouter des logs

async function bootstrap() {
  // Création de l'application NestJS normale
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


  await app.listen(3000);
  Logger.log('Application started on port 3000', 'Bootstrap'); // Log lorsque l'application commence à écouter
}

// Appelle la fonction bootstrap pour lancer l'application
bootstrap();
