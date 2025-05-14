import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ à ajouter

import { ExpertRoutingModule } from './expert-routing.module';
import { ExpertComponent } from './expert.component';
import { DehasbortExpertComponent } from './dehasbort/dehasbort.component';
import { ConstatListComponent } from './constat-list/constat-list.component';
import { ConstatEnAttenteComponent } from './constat-en-attente/constat-en-attente.component';
import { ConstatEnCoursComponent } from './constat-en-cours/constat-en-cours.component';
import { ConstatTermineeComponent } from './constat-terminee/constat-terminee.component';
import { NotificationComponent } from './notification/notification.component';
import { AccountComponent } from './account/account.component';
import { AcceuilComponent } from './acceuil/acceuil.component';


@NgModule({
  declarations: [
    ExpertComponent,
    DehasbortExpertComponent,
    ConstatListComponent,
    ConstatEnAttenteComponent,
    ConstatEnCoursComponent,
    ConstatTermineeComponent,
    NotificationComponent,
    AccountComponent,
    AcceuilComponent
  ],
  imports: [
    CommonModule,
    ExpertRoutingModule,

    FormsModule // ✅ à ajouter ici
  ]
})
export class ExpertModule { }
