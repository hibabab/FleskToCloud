export interface ConducteurDto {
    nom: string;
    prenom: string;
    adresse: {
      pays: string;
      ville: string;
      rue: string;
      codePostal: string;
    };
    permis: {
      numero: string;
      dateDelivrance: Date;
    };
  }
  