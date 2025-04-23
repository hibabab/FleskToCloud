import { IsBoolean, IsDate, IsInt, IsString, IsNotEmpty } from 'class-validator';

export class ExpertDto {
  @IsInt()
  
  userId: number; 

  @IsBoolean()
  disponibilite: boolean; 

  @IsInt()
  
  nbAnneeExperience: number; 
  @IsString()
  
  specialite: string; 

  @IsDate()
  @IsNotEmpty()
  dateInscri: Date;
}