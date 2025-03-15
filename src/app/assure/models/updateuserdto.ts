import { AdresseDto } from "../../espace-client/models/adresse-dto";

export interface updateUserDto {
    telephone: string;
  email: string;
  date_naissance: string;
  adresse: AdresseDto;
}
