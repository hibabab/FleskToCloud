import {
    IsString,
    IsNotEmpty,
    IsNumber,
    IsDateString,
  } from 'class-validator';
  
  export class CreateContratVieDto {
   
    @IsNumber()
    cotisation: number;
    @IsDateString()
    dateEffet: Date;
    @IsString()
    @IsNotEmpty()
    garanties: string;
    @IsString()
    etat?: 'valide' | 'invalide';
  }
  