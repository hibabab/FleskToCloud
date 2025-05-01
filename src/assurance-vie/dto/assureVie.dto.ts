import { IsString, IsDecimal, IsInt, IsDate, IsNotEmpty } from 'class-validator';

export class CreateAssureVieDto {

  @IsNotEmpty()
  @IsString()
  situationProfessionnelle: string;

  @IsNotEmpty()
  revenuMensuel: number;


}

export class UpdateAssureVieDto {
  @IsNotEmpty()
  @IsString()
  situationProfessionnelle?: string;

  @IsDecimal()
  revenuMensuel?: number;
}
