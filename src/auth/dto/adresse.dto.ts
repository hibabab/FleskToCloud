import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class AdresseDto {
  @IsString()
  @IsNotEmpty()
  rue: string;

  @IsOptional()
  @IsNumber()
  numMaison?: number;

  @IsString()
  @IsNotEmpty()
  ville: string;

  @IsString()
  @IsNotEmpty()
  gouvernat: string; // Nouveau champ ajouté

  @IsNotEmpty()
  codePostal: number;

  @IsString()
  @IsNotEmpty()
  pays: string;
}
