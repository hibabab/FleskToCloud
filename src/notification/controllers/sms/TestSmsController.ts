import { Body, Controller, Post } from '@nestjs/common';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { SmsService } from 'src/notification/services/sms/sms.service';
class TestSmsDto {
    @IsNotEmpty()
    @IsString()
    @Matches(/^\+216[0-9]{8}$/, {
      message: 'Le numéro de téléphone doit être au format tunisien valide (+216XXXXXXXX)'
    })
    telephone: string;
  
    @IsNotEmpty()
    @IsString()
    @MaxLength(160, {
      message: 'Le message ne doit pas dépasser 160 caractères'
    })
    message: string;
  }

@Controller('api/test')
export class TestSmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('sms')
  async testSms(@Body() testSmsDto: TestSmsDto) {
    const resultat = await this.smsService.envoyerSms(
      testSmsDto.telephone,
      testSmsDto.message
    );

    return {
      success: resultat,
      message: resultat 
        ? 'SMS envoyé avec succès' 
        : 'Échec de l\'envoi du SMS',
      destinataire: testSmsDto.telephone,
      contenu: testSmsDto.message
    };
  }
}