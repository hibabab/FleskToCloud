import { IsEnum , IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { TypeGaranties } from '../enums/enums';




export class CreateGarantiesDto {
  @IsEnum(TypeGaranties)
  @IsNotEmpty({ message: 'Le type de garantie est obligatoire' })
  type: TypeGaranties; 
  @IsNumber()
  @IsOptional()
  franchise?: number  | null; 

  @IsNumber()
  @IsOptional()
  capital?: number  | null; 
  @IsNumber()
  @IsNotEmpty({ message: 'La cotisation nette est obligatoire' })
  cotisationNette: number; 
}

export class UpdateGarantiesDto {
  @IsEnum(TypeGaranties)
  
  type: TypeGaranties; 

  

  @IsNumber()
  @IsOptional()
   // Si vous souhaitez expliciter que null est accepté
  franchise?: number | null; 

  @IsNumber()
  @IsOptional()
  capital?: number  | null;

  @IsNumber()
  
  cotisationNette: number; 
}