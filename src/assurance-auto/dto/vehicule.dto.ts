import { Optional } from '@nestjs/common';
import { IsInt, IsString, IsDateString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateVehiculeDto {
  @IsString()
  @IsNotEmpty({ message: 'Le type est obligatoire' })
  type: string;

  @IsString()
  @IsNotEmpty({ message: 'La marque est obligatoire' })
  marque: string;

  @IsString()
  @IsNotEmpty({ message: 'Le modèle est obligatoire' })
  model: string;

  @IsString()
  @IsNotEmpty({ message: "L'immatriculation est obligatoire" })
  Imat: string;

  @IsString()
  @Optional()
  energie: string;

  @IsInt()
  @IsNotEmpty({ message: 'Le nombre de places est obligatoire' })
  nbPlace: number;

  

  @IsDateString()
  @IsNotEmpty({ message: 'La date de première mise en circulation est obligatoire' })
  DPMC: string; // Utilisez `string` au lieu de `Date`

  @IsString()
  @IsNotEmpty({ message: 'La cylindrée est obligatoire' })
  cylindree: string;

  @IsInt()
  @Optional()
  chargeUtil: number;

  @IsNumber()
  @IsNotEmpty({ message: 'La valeur neuve est obligatoire' })
  valeurNeuf: number;

  @IsString()
  @IsNotEmpty({ message: 'Le numéro de chassis est obligatoire' })
  numChassis: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsNotEmpty({ message: 'Le poids à vide est obligatoire' })
  poidsVide: number;

  @IsInt()
  @IsNotEmpty({ message: 'La puissance est obligatoire' })
  puissance: number;
}