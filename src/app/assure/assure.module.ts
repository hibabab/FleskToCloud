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
    CASemstrielComponent
  ],
  imports: [
    CommonModule,
    FormsModule, // Assurez-vous qu'il est bien importé ici
    AssureRoutingModule,
    ReactiveFormsModule,
    MatIconModule,
    HttpClientModule,
    MatSnackBarModule,

  ]
})
export class AssureModule { }
