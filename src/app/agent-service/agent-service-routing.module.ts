import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CreationContratComponent } from '../contrat/creation-contrat/creation-contrat.component';

import { DashbortComponent } from './dashbort/dashbort.component';
import { ContratAutoComponent } from './contrat-auto/contrat-auto.component';


const routes: Routes = [ { path: 'dashbort-agent', component: DashbortComponent },
  { path: 'creationCA', component: CreationContratComponent },
  { path: 'CA', component: ContratAutoComponent },
 ];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentServiceRoutingModule { }
