import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DehasbortExpertComponent } from './dehasbort/dehasbort.component';
import { ConstatEnAttenteComponent } from './constat-en-attente/constat-en-attente.component';
import { ConstatEnCoursComponent } from './constat-en-cours/constat-en-cours.component';
import { ConstatTermineeComponent } from './constat-terminee/constat-terminee.component';
import { NotificationComponent } from './notification/notification.component';
import { AccountComponent } from './account/account.component';
import { AcceuilComponent } from './acceuil/acceuil.component';


const routes: Routes = [
  { path: '', redirectTo: 'acceuil', pathMatch: 'full' }, // 👈 Route par défaut
  { path: 'dashboard-expert', component: DehasbortExpertComponent },
  { path: 'constats/en-attente', component: ConstatEnAttenteComponent },
  { path: 'constats/en-cours', component: ConstatEnCoursComponent },
  { path: 'constats/terminee', component: ConstatTermineeComponent },
  { path: 'notification', component: NotificationComponent },
  { path: 'account', component: AccountComponent },
  { path: 'acceuil', component: AcceuilComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpertRoutingModule { }
