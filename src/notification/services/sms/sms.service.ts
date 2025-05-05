import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio'; 

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly twilioClient: any;
  private readonly senderNumber: string |undefined;
  private readonly senderName: string;

  constructor(private configService: ConfigService) {
    // Initialiser le client Twilio avec les informations d'identification
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID') || 'ACac2f2713ea6d5cf95b847185e04c1e18';
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN') || 'cc305eae2b786439cd504f9416d76e39';
    this.twilioClient = twilio(accountSid, authToken);
    
    // Le numéro d'expéditeur Twilio (à configurer dans votre compte Twilio)
    this.senderNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');
    this.senderName = 'Assurance Flesk Cover';
  }

  async envoyerSms(numeroTelephone: string, message: string): Promise<boolean> {
    try {
      // S'assurer que le numéro est au format international
      const numero = this.formaterNumeroTelephone(numeroTelephone);
      
      // Ajouter le nom de l'expéditeur au début du message si nécessaire
      const messageComplet = `${this.senderName}: ${message}`;
      
      // Envoyer le SMS via Twilio
      const result = await this.twilioClient.messages.create({
        body: messageComplet,
        from: this.senderNumber,
        to: numero
      });

      this.logger.log(`SMS envoyé avec succès à ${numero}, SID: ${result.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`Erreur lors de l'envoi du SMS: ${error.message}`);
      return false;
    }
  }

  private formaterNumeroTelephone(numero: string): string {
    // Supprimer les espaces et autres caractères non numériques
    let formatted = numero.replace(/\D/g, '');
    
    // S'assurer que le numéro commence par le code du pays avec le +
    if (!formatted.startsWith('216') && !formatted.startsWith('+216')) {
      // Ajouter le préfixe tunisien si nécessaire
      formatted = '+216' + formatted;
    } else if (formatted.startsWith('216')) {
      // Ajouter le + si seulement le code pays est présent
      formatted = '+' + formatted;
    }
    
    return formatted;
  }
}