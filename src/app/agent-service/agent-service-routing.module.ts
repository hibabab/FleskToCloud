import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CreationContratComponent } from '../contrat/creation-contrat/creation-contrat.component';

import { DashbortComponent } from './dashbort/dashbort.component';
import { ContratAutoComponent } from './contrat-auto/contrat-auto.component';
import { CreationCompteComponent } from './creation-compte/creation-compte.component';
import { RenouvellementCAComponent } from './renouvellement-ca/renouvellement-ca.component';
import { ContratAutoSemestrielComponent } from './contrat-auto-semestriel/contrat-auto-semestriel.component';
import { ContratListComponent } from './contrat-list/contrat-list.component';
import { InterfaceAgentComponent } from './interface-agent/interface-agent.component';
import { DevisCAComponent } from './devis-ca/devis-ca.component';
import { ListeExpertComponent } from './liste-expert/liste-expert.component';
import { ListeAutoComponent } from './liste-auto/liste-auto.component';



const routes: Routes = [ { path: 'dashbort-agent', component: DashbortComponent },
  { path: 'creationCA', component: CreationContratComponent },
  { path: 'CA', component: ContratAutoComponent },
  { path: 'compte', component: CreationCompteComponent},
  { path: 'renouvellementCA', component: RenouvellementCAComponent},
  { path: 'semstrielCA', component: ContratAutoSemestrielComponent},
  { path: 'tousCA', component: ContratListComponent},
  { path: 'interface', component: InterfaceAgentComponent},
  { path: 'devis', component: DevisCAComponent},
  { path: 'liste-expert', component: ListeExpertComponent },
  { path: 'liste-auto', component: ListeAutoComponent },

 ];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentServiceRoutingModule { }
