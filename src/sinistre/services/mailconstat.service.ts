import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailConstatService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'gladys63@ethereal.email',
        pass: 'RDtuSWTM5bBR6Qw9JR',
      },
    });
  }

  async sendConstatEmail(
    conducteur1Email: string,
    conducteur2Email: string,
    constatDetails: {
      date: string;
      heure: string;
      lieu: string;
    },
  ) {
    const { date, heure, lieu } = constatDetails;

    const mailOptions = {
      from: '"FleskCover" <support@fleskcover.com>',
      to: `${conducteur1Email}, ${conducteur2Email}`,
      subject: 'Confirmation de votre déclaration de constat - FleskCover',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Bonjour,</p>
          <p>Nous vous confirmons la bonne réception de votre déclaration de constat.</p>
          
          <p><strong>Détails de l'accident :</strong></p>
          <ul>
            <li><strong>Date :</strong> ${date}</li>
            <li><strong>Heure :</strong> ${heure}</li>
            <li><strong>Lieu :</strong> ${lieu}</li>
          </ul>

          <p>Une copie de ce constat a été envoyée aux deux parties impliquées.</p>

          <p>Pour toute question, notre équipe reste à votre disposition :</p>
          <p>📧 <a href="mailto:support@fleskcover.com">support@fleskcover.com</a><br>
          📞 +216 71 123 456</p>

          <p>Cordialement,<br>
          <strong>L'équipe FleskCover</strong></p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
