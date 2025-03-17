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


@NgModule({
  declarations: [
    AssureComponent,
    AccountComponent,
    ChangePasswordComponent,
    AceuilComponent,
    DashboardComponent,
    DeviComponent,
    CreationContratComponent
  ],
  imports: [
    CommonModule,
    FormsModule, // Assurez-vous qu'il est bien importé ici
    AssureRoutingModule,
    ReactiveFormsModule,
    MatIconModule,

  ]
})
export class AssureModule { }
