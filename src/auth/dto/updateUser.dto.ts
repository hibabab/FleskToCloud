import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AdresseDto } from './adresse.dto';


export class updateUserDto {
  @IsString()
  @IsNotEmpty()
  telephone: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  date_naissance: Date;
  @IsOptional() // Permet d'ignorer l'adresse si elle n'est pas envoyée
  @ValidateNested()
  @Type(() => AdresseDto)
  adresse?: AdresseDto;
}
