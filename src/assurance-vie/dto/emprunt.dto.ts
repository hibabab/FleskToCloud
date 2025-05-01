// create-emprunt.dto.ts
import { IsDateString, IsDecimal, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateEmpruntDto {
  @IsNotEmpty()
  @IsString()
  organismePreteur: string;

  @IsNotEmpty()

  montantPret: number;

  @IsNotEmpty()
  @IsDateString()
  dateEffet: Date;

  @IsNotEmpty()
  @IsDateString()
  datePremierR: Date;

  @IsNotEmpty()
  @IsDateString()
  dateDernierR: Date;

  @IsNotEmpty()
  @IsString()
  typeAmortissement: string;

  @IsNotEmpty()
  @IsString()
  periodiciteAmortissement: string;

  @IsNotEmpty()
  
  tauxInteret: number;


}