import { Component, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { NotificationService, Notification } from '../Services/notification.service';
import { HttpClient } from '@angular/common/http';
export enum TypeGaranties {
  ResponsabiliteCivile = 'ResponsabiliteCivile',
  RTI = 'RTI',
  DefenseEtRecours = 'DefenseEtRecours',
  Incendie = 'Incendie',
  Vol = 'Vol',
  PersonneTransportees = 'PersonneTransportees',
  BrisDeGlaces = 'BrisDeGlaces',
  Tierce = 'Tierce',
  AssistanceAutomobile = 'AssistanceAutomobile',
  IndividuelAccidentConducteur = 'IndividuelAccidentConducteur',
  EVENEMENTCLIMATIQUE = 'Evènements climatiques',
  GREVESEMEUTESETMOUVEMENTPOPULAIRE = 'Grèves Emeutes et Mouvements populaires',
  DOMMAGEETCOLLIDION = 'Dommage et Collision'
}
interface AssureDto {
  bonusMalus: number;
}

interface CreateVehiculeDto {
  type: string;
  marque: string;
  model: string;
  Imat: string;
  energie: string;
  nbPlace: number;
  DPMC: string;
  cylindree: string;
  chargeUtil?: string;
  valeurNeuf: number;
  numChassis: string;
  poidsVide: number;
  puissance: number;
}
interface CreateGarantiesDto {
  type: TypeGaranties;
  capital?: number;
  cotisationNette: number;
  franchise?: number;
}
interface ContratAutoDto {
  dateSouscription: string;
  dateExpiration: string;
  dateEffet: string;
  NatureContrat: string;
  typePaiement: string;
  echeances: string;
  cotisationNette: number;
  packChoisi?: string;
  cotisationTotale: number;
  montantEcheance: number;
  garanties?: CreateGarantiesDto[];
}
@Component({
  selector: 'app-notification',
  standalone: false,
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  userId!: number;
  selectedNotification: Notification | null = null;
  showDetailsModal: boolean = false;
  loading: boolean = false;
  formattedMetadata: any = null;
  templateGaranties: any[] = [];

  constructor(
    private notificationService: NotificationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.decodeUserIdFromToken();
    if (this.userId) {
      this.loadNotifications();
    }
  }

  private decodeUserIdFromToken(): void {
    const token = this.getCookie('access_token');
    if (token) {
      const decoded: any = jwtDecode(token);
      this.userId = Number(decoded.sub);
    } else {
      console.error('Token non trouvé');
    }
  }

  private loadNotifications(): void {
    this.loading = true;
    this.notificationService.getNotifications(this.userId).subscribe(
      (data) => {
        this.notifications = this.notificationService.sortNotificationsByDate(data);
        this.loading = false;
      },
      (error) => {
        console.error('Erreur chargement notifications :', error);
        this.loading = false;
      }
    );
  }
 getGarantieFromTemplate(type: TypeGaranties): any {
    return this.templateGaranties.find(g => g.type === type) || {};
  }
  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  private extractNotificationId(message: string): number | null {
    const match = message.match(/ID: (\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  viewNotificationDetails(notification: Notification): void {
    if (notification.message.includes('Nouvelle demande de souscription')) {
      const notificationId = this.extractNotificationId(notification.message);

      if (notificationId) {
        this.loading = true;
        this.notificationService.getNotificationDetails(notificationId).subscribe(
          (detailedNotif) => {
            this.selectedNotification = detailedNotif;

            if (detailedNotif.metadata) {
              this.formatMetadata(detailedNotif.metadata);
            }

            this.showDetailsModal = true;
            this.loading = false;

            // Marquer la notification comme lue sur le serveur et dans l'interface locale
            if (!notification.isRead) {
              this.notificationService.markAsRead(notification.id).subscribe(
                (updatedNotif) => {
                  // Mettre à jour la notification dans la liste locale
                  const index = this.notifications.findIndex(n => n.id === notification.id);
                  if (index !== -1) {
                    this.notifications[index].isRead = true;
                  }
                },
                (error) => {
                  console.error('Erreur lors du marquage comme lu:', error);
                }
              );
            }
          },
          (error) => {
            console.error('Erreur lors du chargement des détails:', error);
            this.loading = false;
          }
        );
      }
    } else {
      this.selectedNotification = notification;
      this.showDetailsModal = true;

      // Marquer la notification comme lue
      if (!notification.isRead) {
        this.notificationService.markAsRead(notification.id).subscribe(
          (updatedNotif) => {
            // Mettre à jour la notification dans la liste locale
            const index = this.notifications.findIndex(n => n.id === notification.id);
            if (index !== -1) {
              this.notifications[index].isRead = true;
            }
          },
          (error) => {
            console.error('Erreur lors du marquage comme lu:', error);
          }
        );
      }
    }
  }
  formatMetadata(metadata: any): void {
    this.formattedMetadata = {};

    for (const key in metadata) {
      if (metadata.hasOwnProperty(key)) {
        const value = metadata[key];

        if (typeof value === 'object' && value !== null) {
          this.formattedMetadata[key] = this.flattenObject(value, key);
        } else {
          this.formattedMetadata[key] = value;
        }
      }
    }
  }

  flattenObject(obj: any, parentKey: string = ''): any {
    const flattened: any = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        const newKey = key;

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const flatObject = this.flattenObject(value, newKey);
          for (const subKey in flatObject) {
            flattened[subKey] = flatObject[subKey];
          }
        } else {
          flattened[newKey] = value;
        }
      }
    }

    return flattened;
  }

  closeModal(): void {
    this.showDetailsModal = false;
    this.selectedNotification = null;
    this.formattedMetadata = null;
  }

  processRequest(decision: 'accept' | 'reject'): void {
    if (!this.selectedNotification?.id) {
        return;
    }

    this.loading = true;
    const agent = { id: this.userId };
    const notificationId = this.selectedNotification.id;
    const userId = this.selectedNotification.user?.id;

    const handleFinalize = () => {
        this.loading = false;
        this.closeModal();
        this.loadNotifications();
    };

    const handleError = (error: any, context: string) => {
        console.error(`Erreur lors de ${context}:`, error);
        this.loading = false;
    };

    this.notificationService.processSubscriptionRequest(
        agent,
        notificationId,
        decision
    ).subscribe({
        next: (result) => {
            if (decision === 'reject') {
                if (!userId) {
                    handleFinalize();
                    return;
                }

                this.notificationService.sendNotification({
                    userId: userId,
                    message: "Votre demande de souscription a été refusée. Veuillez vous rendre à notre local pour faire la souscription en personne.",
                    type: "subscription_rejected"
                }).subscribe({
                    next: handleFinalize,
                    error: (error) => handleError(error, "l'envoi de la notification de refus")
                });
            } else if (decision === 'accept') {
                if (!this.selectedNotification) {
                    this.loading = false;
                    return;
                }

                const contratData = this.formatContractData(this.selectedNotification);
                const requestData = {
                    assure: contratData.assure,
                    Cin: contratData.Cin || '',
                    vehicule: contratData.vehicule,
                    contrat: contratData.contrat
                };

                this.http.post<{success: boolean, data: any, message: string}>(
                    'http://localhost:3000/contrat-auto-geteway/createCA',
                    requestData
                ).subscribe({
                    next: (response) => {
                        if (!response.success) {
                            handleError(response.message, "la création du contrat");
                            return;
                        }


                        console.log('Contrat créé:', response.data);

                        const contratID = response.data.num;

                        if (!userId || !contratID) {
                            handleFinalize();
                            return;
                        }

                        const paymentLink = `/dashboard-assure/contrat/${contratID}/payment`;
                        const notificationPayload = {
                            userId: userId,
                            message: "Votre demande de souscription a été acceptée! Vous pouvez maintenant procéder au paiement pour finaliser votre contrat.",
                            type: "subscription_accepted",
                            link: paymentLink,
                            contractId: contratID,
                            metadata: {
                                contratId: contratID,
                                paymentLink: paymentLink,
                                status: "pending_payment",
                                contratNumero: response.data.num,
                                contratDetails: {
                                    dateDebut: response.data.dateSouscription,
                                    dateFin: response.data.dateExpiration,
                                    montant: response.data.cotisationTotale || 0
                                }
                            }
                        };

                        this.notificationService.sendNotification(notificationPayload).subscribe({
                            next: handleFinalize,
                            error: (error) => handleError(error, "l'envoi de la notification d'acceptation")
                        });
                    },
                    error: (error) => handleError(error, "la création du contrat")
                });
            }
        },
        error: (error) => handleError(error, `du traitement de la demande d'${decision === 'accept' ? 'acceptation' : 'refus'}`)
    });
}

  private formatContractData(notification: Notification): any {
    const metadata = notification.metadata || {};
    const user = notification.user || {};

    const garanties = this.calculateGaranties(
      metadata.contrat?.packChoisi || 'Pack1',
      metadata.vehicule || {},
      metadata.assure?.bonusMalus || 1
    );

    const cotisationNette = this.roundToThreeDecimals(
      garanties.reduce((sum, garantie) => sum + (garantie.cotisationNette || 0), 0)
    );

    const cotisationTotale = this.roundToThreeDecimals(
      cotisationNette + 50.000 + 3.800 + 0.800 + 10.000 + 3.000 + 1.000
    );

    const today = new Date();
    const dateSouscription = today.toISOString().split('T')[0];
    const dateEffet = dateSouscription;
    const dateExpiration = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0];

    const date = new Date();
    switch((metadata.contrat?.typePaiement || '').toLowerCase()) {
      case 'Semestriel':
        date.setMonth(date.getMonth() + 6);
        break;
      case 'Annuel':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        date.setMonth(date.getMonth() + 1);
    }
    const echeances = date.toISOString().split('T')[0];

    return {
      assure: {
        bonusMalus: metadata.assure?.bonusMalus || 1
      },
      Cin: user.Cin || '',
      vehicule: metadata.vehicule || {},
      contrat: {
        dateSouscription,
        dateExpiration,
        dateEffet,
        NatureContrat: metadata.contrat?.NatureContrat ,
        typePaiement: metadata.contrat?.typePaiement ,
        echeances,
        cotisationNette,
        packChoisi: metadata.contrat?.packChoisi || 'Pack1',
        cotisationTotale,
        montantEcheance: metadata.contrat?.typePaiement === 'Semestriel'
          ? this.roundToThreeDecimals(cotisationTotale / 2)
          : cotisationTotale,
        garanties
      }
    };
  }

  private roundToThreeDecimals(value: number): number {
    return Math.round(value * 1000) / 1000;
  }

   calculateGaranties(packChoisi: string, vehiculeData: any, bonusMalus: number): any[] {
      const garanties = [];
      const valeurNeuf = this.roundToThreeDecimals(vehiculeData.valeurNeuf);
      const puissance = vehiculeData.puissance;
      const responsabiliteCivile = this.calculateResponsabiliteCivile(vehiculeData.type, bonusMalus, puissance);

      if (packChoisi === 'Pack1') {
        garanties.push({
          type: TypeGaranties.ResponsabiliteCivile,
          cotisationNette: responsabiliteCivile
        });

        garanties.push({
          type: TypeGaranties.RTI,
          cotisationNette: 0.000
        });

        const defenseEtRecours = this.getGarantieFromTemplate(TypeGaranties.DefenseEtRecours);
        garanties.push({
          type: TypeGaranties.DefenseEtRecours,
          capital: defenseEtRecours.capital || 1000.000,
          cotisationNette: defenseEtRecours.cotisationNette || 50.000
        });

        garanties.push({
          type: TypeGaranties.Incendie,
          capital: valeurNeuf,
          cotisationNette: this.roundToThreeDecimals(valeurNeuf / 220.115)
        });

        garanties.push({
          type: TypeGaranties.Vol,
          capital: valeurNeuf,
          cotisationNette: this.roundToThreeDecimals(valeurNeuf / 336.446)
        });

        garanties.push({
          type: TypeGaranties.PersonneTransportees,
          capital: 5000.000,
          cotisationNette: 50.000
        });

        const brisGlacesCapital = this.roundToThreeDecimals(valeurNeuf <= 30000 ? 500.000 : 600.000);
        garanties.push({
          type: TypeGaranties.BrisDeGlaces,
          capital: brisGlacesCapital,
          cotisationNette: this.roundToThreeDecimals(brisGlacesCapital * 0.075)
        });

        const assistanceAuto = this.getGarantieFromTemplate(TypeGaranties.AssistanceAutomobile);
        garanties.push({
          type: TypeGaranties.AssistanceAutomobile,
          cotisationNette: assistanceAuto.cotisationNette || 71.500
        });

        const accidentConducteur = this.getGarantieFromTemplate(TypeGaranties.IndividuelAccidentConducteur);
        garanties.push({
          type: TypeGaranties.IndividuelAccidentConducteur,
          capital: accidentConducteur.capital || 20000.000,
          cotisationNette: accidentConducteur.cotisationNette || 25.000
        });
      }
      else if (packChoisi === 'Pack2') {
        garanties.push({
          type: TypeGaranties.ResponsabiliteCivile,
          cotisationNette: responsabiliteCivile
        });

        garanties.push({
          type: TypeGaranties.RTI,
          cotisationNette: 0.000
        });

        const defenseEtRecours = this.getGarantieFromTemplate(TypeGaranties.DefenseEtRecours);
        garanties.push({
          type: TypeGaranties.DefenseEtRecours,
          capital: defenseEtRecours.capital || 1000.000,
          cotisationNette: defenseEtRecours.cotisationNette || 50.000
        });

        garanties.push({
          type: TypeGaranties.Incendie,
          capital: valeurNeuf,
          cotisationNette: this.roundToThreeDecimals(valeurNeuf / 220.115)
        });

        garanties.push({
          type: TypeGaranties.Vol,
          capital: valeurNeuf,
          cotisationNette: this.roundToThreeDecimals(valeurNeuf / 336.446)
        });

        garanties.push({
          type: TypeGaranties.PersonneTransportees,
          capital: 5000.000,
          cotisationNette: 50.000
        });

        const brisGlacesCapital = this.roundToThreeDecimals(valeurNeuf <= 30000 ? 500.000 : 600.000);
        garanties.push({
          type: TypeGaranties.BrisDeGlaces,
          capital: brisGlacesCapital,
          cotisationNette: this.roundToThreeDecimals(brisGlacesCapital * 0.075)
        });

        const assistanceAuto = this.getGarantieFromTemplate(TypeGaranties.AssistanceAutomobile);
        garanties.push({
          type: TypeGaranties.AssistanceAutomobile,
          cotisationNette: assistanceAuto.cotisationNette || 71.500
        });

        const accidentConducteur = this.getGarantieFromTemplate(TypeGaranties.IndividuelAccidentConducteur);
        garanties.push({
          type: TypeGaranties.IndividuelAccidentConducteur,
          capital: accidentConducteur.capital || 20000.000,
          cotisationNette: accidentConducteur.cotisationNette || 25.000
        });

        const evenementClimatique = this.getGarantieFromTemplate(TypeGaranties.EVENEMENTCLIMATIQUE);
        garanties.push({
          type: TypeGaranties.EVENEMENTCLIMATIQUE,
          cotisationNette: evenementClimatique.cotisationNette || 25.000
        });

        const grevesEmeutes = this.getGarantieFromTemplate(TypeGaranties.GREVESEMEUTESETMOUVEMENTPOPULAIRE);
        garanties.push({
          type: TypeGaranties.GREVESEMEUTESETMOUVEMENTPOPULAIRE,
          cotisationNette: grevesEmeutes.cotisationNette || 25.000
        });

        garanties.push({
          type: TypeGaranties.DOMMAGEETCOLLIDION,
          capital: valeurNeuf,
          cotisationNette: this.roundToThreeDecimals(valeurNeuf * 0.05)
        });
      }
      else if (packChoisi === 'Pack3') {
        garanties.push({
          type: TypeGaranties.RTI,
          cotisationNette: 0.000
        });

        const defenseEtRecours = this.getGarantieFromTemplate(TypeGaranties.DefenseEtRecours);
        garanties.push({
          type: TypeGaranties.DefenseEtRecours,
          capital: defenseEtRecours.capital || 1000.000,
          cotisationNette: defenseEtRecours.cotisationNette || 50.000
        });

        garanties.push({
          type: TypeGaranties.Incendie,
          capital: valeurNeuf,
          cotisationNette: this.roundToThreeDecimals(valeurNeuf / 220.115)
        });

        garanties.push({
          type: TypeGaranties.Vol,
          capital: valeurNeuf,
          cotisationNette: this.roundToThreeDecimals(valeurNeuf / 336.446)
        });

        garanties.push({
          type: TypeGaranties.PersonneTransportees,
          capital: 5000.000,
          cotisationNette: 50.000
        });

        const brisGlacesCapital = this.roundToThreeDecimals(valeurNeuf <= 30000 ? 500.000 : 600.000);
        garanties.push({
          type: TypeGaranties.BrisDeGlaces,
          capital: brisGlacesCapital,
          cotisationNette: this.roundToThreeDecimals(brisGlacesCapital * 0.075)
        });

        const assistanceAuto = this.getGarantieFromTemplate(TypeGaranties.AssistanceAutomobile);
        garanties.push({
          type: TypeGaranties.AssistanceAutomobile,
          cotisationNette: assistanceAuto.cotisationNette || 71.500
        });

        const accidentConducteur = this.getGarantieFromTemplate(TypeGaranties.IndividuelAccidentConducteur);
        garanties.push({
          type: TypeGaranties.IndividuelAccidentConducteur,
          capital: accidentConducteur.capital || 20000.000,
          cotisationNette: accidentConducteur.cotisationNette || 25.000
        });

        const evenementClimatique = this.getGarantieFromTemplate(TypeGaranties.EVENEMENTCLIMATIQUE);
        garanties.push({
          type: TypeGaranties.EVENEMENTCLIMATIQUE,
          cotisationNette: evenementClimatique.cotisationNette || 25.000
        });

        const grevesEmeutes = this.getGarantieFromTemplate(TypeGaranties.GREVESEMEUTESETMOUVEMENTPOPULAIRE);
        garanties.push({
          type: TypeGaranties.GREVESEMEUTESETMOUVEMENTPOPULAIRE,
          cotisationNette: grevesEmeutes.cotisationNette || 25.000
        });

        garanties.push({
          type: TypeGaranties.Tierce,
          capital: valeurNeuf,
          franchise: 0.200,
          cotisationNette: this.roundToThreeDecimals(valeurNeuf * 0.02)
        });

        garanties.push({
          type: TypeGaranties.ResponsabiliteCivile,
          cotisationNette: responsabiliteCivile
        });
      }

      return garanties;
    }

    calculateResponsabiliteCivile(type: string, bonusMalus: number, puissance: number): number {
      let cotisation = 0;
      if (type === 'Tourisme') {
        switch (bonusMalus) {
          case 11:
            if (puissance === 4) cotisation = 385;
            else if (puissance === 5) cotisation = 490;
            else if (puissance === 6) cotisation = 490;
            else if (puissance === 7) cotisation = 595;
            break;
          case 10:
            if (puissance === 4) cotisation = 330;
            else if (puissance === 5) cotisation = 420;
            else if (puissance === 6) cotisation = 420;
            else if (puissance === 7) cotisation = 510;
            break;
          case 9:
            if (puissance === 4) cotisation = 275;
            else if (puissance === 5) cotisation = 350;
            else if (puissance === 6) cotisation = 350;
            else if (puissance === 7) cotisation = 425;
            break;
          case 8:
            if (puissance === 4) cotisation = 220;
            else if (puissance === 5) cotisation = 280;
            else if (puissance === 6) cotisation = 280;
            else if (puissance === 7) cotisation = 340;
            break;
          case 7:
            if (puissance === 4) cotisation = 176;
            else if (puissance === 5) cotisation = 224;
            else if (puissance === 6) cotisation = 224;
            else if (puissance === 7) cotisation = 272;
            break;
          case 6:
            if (puissance === 4) cotisation = 154;
            else if (puissance === 5) cotisation = 196;
            else if (puissance === 6) cotisation = 196;
            else if (puissance === 7) cotisation = 238;
            break;
          case 5:
            if (puissance === 4) cotisation = 132;
            else if (puissance === 5) cotisation = 168;
            else if (puissance === 6) cotisation = 168;
            else if (puissance === 7) cotisation = 204;
            break;
          case 4:
            if (puissance === 4) cotisation = 110;
            else if (puissance === 5) cotisation = 140;
            else if (puissance === 6) cotisation = 140;
            else if (puissance === 7) cotisation = 170;
            break;
          case 3:
            if (puissance === 4) cotisation = 99;
            else if (puissance === 5) cotisation = 126;
            else if (puissance === 6) cotisation = 126;
            else if (puissance === 7) cotisation = 153;
            break;
          case 2:
            if (puissance === 4) cotisation = 88;
            else if (puissance === 5) cotisation = 112;
            else if (puissance === 6) cotisation = 112;
            else if (puissance === 7) cotisation = 136;
            break;
          case 1:
            if (puissance === 4) cotisation = 77;
            else if (puissance === 5) cotisation = 98;
            else if (puissance === 6) cotisation = 98;
            else if (puissance === 7) cotisation = 119;
            break;
          default:
            cotisation = 0;
        }
      } else if (type === 'Utilitaire') {
        switch (bonusMalus) {
          case 7:
            if (puissance >= 5 && puissance <= 6) cotisation = 428;
            else if (puissance >= 7 && puissance <= 9) cotisation = 524;
            else if (puissance >= 11 && puissance <= 12) cotisation = 676;
            break;
          case 6:
            if (puissance >= 5 && puissance <= 6) cotisation = 363.8;
            else if (puissance >= 7 && puissance <= 9) cotisation = 445.4;
            else if (puissance >= 11 && puissance <= 12) cotisation = 574.6;
            break;
          case 5:
            if (puissance >= 5 && puissance <= 6) cotisation = 321;
            else if (puissance >= 7 && puissance <= 9) cotisation = 393;
            else if (puissance >= 11 && puissance <= 12) cotisation = 507;
            break;
          case 4:
            if (puissance >= 5 && puissance <= 6) cotisation = 256.8;
            else if (puissance >= 7 && puissance <= 9) cotisation = 314.4;
            else if (puissance >= 11 && puissance <= 12) cotisation = 405.6;
            break;
          case 3:
            if (puissance >= 5 && puissance <= 6) cotisation = 214;
            else if (puissance >= 7 && puissance <= 9) cotisation = 262;
            else if (puissance >= 11 && puissance <= 12) cotisation = 338;
            break;
          case 2:
            if (puissance >= 5 && puissance <= 6) cotisation = 192.6;
            else if (puissance >= 7 && puissance <= 9) cotisation = 235.8;
            else if (puissance >= 11 && puissance <= 12) cotisation = 304.2;
            break;
          case 1:
            if (puissance >= 5 && puissance <= 6) cotisation = 171.2;
            else if (puissance >= 7 && puissance <= 9) cotisation = 209.6;
            else if (puissance >= 11 && puissance <= 12) cotisation = 270.4;
            break;
          default:
            cotisation = 0;
        }
      }
      return this.roundToThreeDecimals(cotisation);
    }
  getFormDataEntries(): {key: string, value: any}[] {
    if (!this.formattedMetadata) return [];
    return Object.entries(this.formattedMetadata).map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        const flatValues = Object.entries(value as object).map(([k, v]) => `${k}: ${v}`).join(', ');
        return { key, value: flatValues };
      }
      return { key, value };
    });
  }


  isObject(value: any): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

processPaymentNotification(): void {
  if (!this.selectedNotification?.id) {
    return;
  }

  this.loading = true;
  const agent = { id: this.userId };
  const notificationId = this.selectedNotification.id;

  this.notificationService.processPaymentNotification(
    agent,
    notificationId
  ).subscribe({
    next: (result) => {
      this.loading = false;
      this.closeModal();
      this.loadNotifications();  // Recharger les notifications pour voir les mises à jour

      // Notifier les autres agents que le contrat est en cours de livraison
      if (this.selectedNotification?.metadata?.contratId) {
        const contratId = this.selectedNotification.metadata.contratId;
        this.notificationService.notifyAllUsers(
          `Le contrat n°${contratId} est en cours de livraison par l'agent ${this.userId}.`
        ).subscribe();
      }
    },
    error: (error) => {
      console.error('Erreur lors du traitement de la notification de paiement:', error);
      this.loading = false;
    }
  });
}
}
