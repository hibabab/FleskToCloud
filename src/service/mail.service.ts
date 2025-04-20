// mail.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // use TLS
      auth: {
        user: 'hibawakel20@gmail.com', // à remplacer par ton adresse Gmail
        pass: 'wuvg mazu rlti feuz', // à remplacer par ton mot de passe d'application
      },
    });
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `http://localhost:4200/espace-client/reset-password?token=${token}`;

    const mailOptions = {
      from: '"Auth Service" <YourEmail@gmail.com>', // Remplace par ton email aussi
      to: to,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
      `,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await this.transporter.sendMail(mailOptions);
  }
}
