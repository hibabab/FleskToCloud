import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Ajout de FormsModule

import { AssureRoutingModule } from './assure-routing.module';
import { AssureComponent } from './assure.component';
import { AccountComponent } from './account/account.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AceuilComponent } from './aceuil/aceuil.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DeviComponent } from './devi/devi.component';
import { MatIconModule } from '@angular/material/icon';
import { CreationContratComponent } from './creation-contrat/creation-contrat.component';
import { PayementCAComponent } from './payement-ca/payement-ca.component';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PaymentInitiateComponent } from './payment/payment-initiate/payment-initiate.component';
import { PaymentSuccessComponent } from './payment/payment-success/payment-success.component';
import { PaymentFailureComponent } from './payment/payment-failure/payment-failure.component';
import { PaymentStatusComponent } from './payment/payment-status/payment-status.component';
import { MesCAComponent } from './mes-ca/mes-ca.component';
import { InterfaceComponent } from './interface/interface.component';
import { RenouvellementCAComponent } from './renouvellement-ca/renouvellement-ca.component';
import { CASemstrielComponent } from './casemstriel/casemstriel.component';
import { VehiculeComponent } from './vehicule/vehicule.component';
import { ConstatComponent } from './constat/constat.component';
import { NotificationComponent } from './notification/notification.component';
import { MesReCuComponent } from './mes-re-cu/mes-re-cu.component';
import { DevisAvieComponent } from './devis-avie/devis-avie.component';
import { PaymentInitiateVieComponent } from './payment-initiate-vie/payment-initiate-vie.component';
import { PaymentSuccessVieComponent } from './payment-success-vie/payment-success-vie.component';
import { DemandeSouscriptionVieComponent } from './demande-souscription-vie/demande-souscription-vie.component';
import { HistoriqueContratVieComponent } from './historique-contrat-vie/historique-contrat-vie.component';



@NgModule({
  declarations: [
    AssureComponent,
    AccountComponent,
    ChangePasswordComponent,
    AceuilComponent,
    DashboardComponent,
    DeviComponent,
    CreationContratComponent,
    PayementCAComponent,
    PaymentInitiateComponent,
    PaymentSuccessComponent,
    PaymentFailureComponent,
    PaymentStatusComponent,
    MesCAComponent,
    InterfaceComponent,
    RenouvellementCAComponent,
    CASemstrielComponent,
    VehiculeComponent,
    ConstatComponent,
    NotificationComponent,
    MesReCuComponent,
    DevisAvieComponent,
    PaymentInitiateVieComponent,
    PaymentSuccessVieComponent,
    DemandeSouscriptionVieComponent,
    HistoriqueContratVieComponent

  ],
  imports: [
    CommonModule,
    FormsModule, // Assurez-vous qu'il est bien importé ici
    AssureRoutingModule,
    ReactiveFormsModule,
    MatIconModule,
    HttpClientModule,
    MatSnackBarModule,

  ],
  exports: [
    VehiculeComponent
  ]
})
export class AssureModule { }
