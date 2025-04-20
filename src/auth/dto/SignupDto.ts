import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
  ValidateNested,
  IsNumber,
} from 'class-validator';

import { Type } from 'class-transformer';
import { AdresseDto } from './adresse.dto';

export class SignupDto {
  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  prenom: string;

  @IsNumber()
  @IsNotEmpty()
  Cin: number;

  @IsString()
  @IsNotEmpty()
  telephone: string; // Utilisez 'telephone' au lieu de 'télephone'

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Le mot de passe doit contenir au moins 8 caractères, dont au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial.',
    },
  )
  password: string;

  @ValidateNested()
  @Type(() => AdresseDto)
  adresse: AdresseDto;

  @IsNotEmpty()
  date_naissance: Date;
  @IsString()
  role: string;
}
