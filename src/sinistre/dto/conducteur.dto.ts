import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { AdresseDto } from 'src/auth/dto/adresse.dto';

export class ConducteurDto {
  @IsString()
  @IsNotEmpty()
  nom: string; // Nom du conducteur

  @IsString()
  @IsNotEmpty()
  prenom: string; // Prénom du conducteur

  @ValidateNested()
  @Type(() => AdresseDto)
  @IsNotEmpty()
  adresse: AdresseDto;

  @IsString()
  @IsNotEmpty()
  numPermis: string; // Numéro de permis (hors base de données)
}
