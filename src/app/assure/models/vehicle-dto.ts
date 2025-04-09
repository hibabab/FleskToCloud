export interface VehicleDto {
    driverPrefix: string; // 'A' ou 'B'
  
  // Assurance
  assurance: {
    societe: string;
    agence: string;
    contratNumero: string;
    dateDebut: Date;
    dateFin: Date;
  };
  
  // Assuré
  assure: {
    nom: string;
    prenom: string;
    estConducteur: boolean;
    numSocietaire: string;
    telephone: string;
    email: string;
    adresse: {
      pays: string;
      ville: string;
      rue: string;
      codePostal: string;
    };
  };
  
  // Conducteur (si différent de l'assuré)
  conducteur?: {
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
  };
  
  // Véhicule
  vehicule: {
    immatriculation: string;
    type: string;
    marque: string;
    modele: string;
    sens: {
      venantDe: string;
      allantA: string;
    };
  };
  
  // Accident
  observations: string;
  degatsApparents: string;
  pointsChoc: { x: number; y: number }[];
}
