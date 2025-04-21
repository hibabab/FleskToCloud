import { IsString, IsInt, IsDate, IsOptional, IsNumber } from 'class-validator';

export class CreateVignetteDto {
  @IsString()
  numQuittance: string;

  @IsDate()
  dateLivrance: Date;

  @IsDate()
  datePeiment: Date;

  @IsString()
  matFiscal: string;

  @IsString()
  titre: string;

  @IsNumber()
  montant: number;

  @IsInt()
  vehiculeId: number;
}

export class UpdateVignetteDto {
  @IsOptional() @IsString()
  numQuittance?: string;

  @IsOptional() @IsDate()
  dateLivrance?: Date;

  @IsOptional() @IsDate()
  datePeiment?: Date;

  @IsOptional() @IsString()
  matFiscal?: string;

  @IsOptional() @IsString()
  titre?: string;

  @IsOptional() @IsNumber()
  montant?: number;

  @IsOptional() @IsInt()
  vehiculeId?: number;
}
