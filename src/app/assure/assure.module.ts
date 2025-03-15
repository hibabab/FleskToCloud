import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Ajout de FormsModule

import { AssureRoutingModule } from './assure-routing.module';
import { AssureComponent } from './assure.component';
import { AccountComponent } from './account/account.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AceuilComponent } from './aceuil/aceuil.component';
import { DashboardComponent } from './dashboard/dashboard.component';


@NgModule({
  declarations: [
    AssureComponent,
    AccountComponent,
    ChangePasswordComponent,
    AceuilComponent,
    DashboardComponent
  ],
  imports: [
    CommonModule,
    FormsModule, // Assurez-vous qu'il est bien importé ici
    AssureRoutingModule,
  
  ]
})
export class AssureModule { }
