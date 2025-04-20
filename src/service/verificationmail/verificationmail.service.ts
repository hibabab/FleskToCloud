import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class VerificationmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Création du transporteur
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // Utilise SSL
      auth: {
        user: 'hibawakel20@gmail.com', // Ton adresse Gmail
        pass: 'wuvg mazu rlti feuz', // Mot de passe d'application Gmail (PAS ton mot de passe perso !)
      },
    });
  }

  async sendVerificationCode(email: string, code: string): Promise<void> {
    const mailOptions = {
      from: '"FleskCover" <hibawakel20@gmail.com>', // Nom de l’expéditeur
      to: email,
      subject: 'Votre code de vérification',
      text: `Bonjour ! Voici votre code de vérification : ${code}`,
    };

    // Envoi de l'email
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.transporter.sendMail(mailOptions);
  }
}
