import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DehasbortExpertComponent } from './dehasbort/dehasbort.component';
import { ConstatEnAttenteComponent } from './constat-en-attente/constat-en-attente.component';
import { ConstatEnCoursComponent } from './constat-en-cours/constat-en-cours.component';
import { ConstatTermineeComponent } from './constat-terminee/constat-terminee.component';
import { NotificationComponent } from './notification/notification.component';


const routes: Routes = [
  { path: 'dashboard-expert', component: DehasbortExpertComponent },
  { path: 'constats/en-attente', component: ConstatEnAttenteComponent },  // 👈 Constats en attente
  { path: 'constats/en-cours', component: ConstatEnCoursComponent },  // 👈 Constats en cours
  { path: 'constats/terminee', component: ConstatTermineeComponent },
  {path:'notification',component:NotificationComponent}  // 👈 Constats terminés
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpertRoutingModule { }
