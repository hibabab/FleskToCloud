import { IsString, IsInt, IsDate, IsOptional } from 'class-validator';

export class CreateCarteGriseDto {
  @IsString()
  nom: string;

  @IsString()
  prenom: string;

  @IsString()
  adresse: string;

  @IsString()
  CIN: string;

  @IsString()
  Activite: string;

  @IsString()
  genre: string;

  @IsString()
  typeConstructeur: string;

  @IsDate()
  DPMC: Date;

  @IsString()
  constructeur: string;

  @IsString()
  typeCommercial: string;

  @IsInt()
  vehiculeId: number;
}

export class UpdateCarteGriseDto {
  @IsOptional() @IsString()
  nom?: string;

  @IsOptional() @IsString()
  prenom?: string;

  @IsOptional() @IsString()
  adresse?: string;

  @IsOptional() @IsString()
  CIN?: string;

  @IsOptional() @IsString()
  Activite?: string;

  @IsOptional() @IsString()
  genre?: string;

  @IsOptional() @IsString()
  typeConstructeur?: string;

  @IsOptional() @IsDate()
  DPMC?: Date;

  @IsOptional() @IsString()
  constructeur?: string;

  @IsOptional() @IsString()
  typeCommercial?: string;

  @IsOptional() @IsInt()
  vehiculeId?: number;
}
