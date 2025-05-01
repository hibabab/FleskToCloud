import { Optional } from '@nestjs/common';
import { IsInt, IsString, IsDateString, IsNumber, IsNotEmpty } from 'class-validator';

export class CreateVehiculeDto {
  @IsString()
 
  type: string;

  @IsString()
  @IsNotEmpty({ message: 'La marque est obligatoire' })
  marque: string;

  @IsString()
 
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

  
  @IsNumber()
  cylindree: number;

  @IsInt()
  @Optional()
  chargeUtil: number;

  @IsNumber()
  @IsNotEmpty({ message: 'La valeur neuve est obligatoire' })
  valeurNeuf: number;

  @IsString()
  @IsNotEmpty({ message: 'Le numéro de chassis est obligatoire' })
  numChassis: string;

  @IsNumber()
  
  poidsVide: number;

  @IsInt()
  @IsNotEmpty({ message: 'La puissance est obligatoire' })
  puissance: number;
}