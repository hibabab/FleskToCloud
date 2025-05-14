import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentServiceRoutingModule } from './agent-service-routing.module';
import { AgentServiceComponent } from './agent-service.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CreationContratComponent } from './creation-contrat/creation-contrat.component';
import { DashbortComponent } from './dashbort/dashbort.component';
import { ContratAutoComponent } from './contrat-auto/contrat-auto.component';
import { RenouvellementCAComponent } from './renouvellement-ca/renouvellement-ca.component';
import { ContratAutoSemestrielComponent } from './contrat-auto-semestriel/contrat-auto-semestriel.component';
import { ContratListComponent } from './contrat-list/contrat-list.component';
import { InterfaceAgentComponent } from './interface-agent/interface-agent.component';
import { DevisCAComponent } from './devis-ca/devis-ca.component';
import { ListeExpertComponent } from './liste-expert/liste-expert.component';
import { ListeAutoComponent } from './liste-auto/liste-auto.component';
import { ConstatListComponent } from './constat-list/constat-list.component';
import { NotificationComponent } from './notification/notification.component';
import { CreationCVieComponent } from './creation-c-vie/creation-c-vie.component';
import { DevisCVieComponent } from './devis-cvie/devis-cvie.component';
import { ListeAssureVieComponent } from './liste-assure-vie/liste-assure-vie.component';
import { HistoriqueContratVieAComponent } from './historique-contrat-vie-a/historique-contrat-vie-a.component';
import { ResiliationComponent } from './resiliation/resiliation.component';
import { AccountComponent } from './account/account.component';



@NgModule({
  declarations: [
    AgentServiceComponent,
CreationContratComponent,
DashbortComponent,
ContratAutoComponent,
RenouvellementCAComponent,
ContratAutoSemestrielComponent,
ContratListComponent,
InterfaceAgentComponent,
DevisCAComponent,
ListeExpertComponent,
ListeAutoComponent,
ConstatListComponent,
NotificationComponent,
CreationCVieComponent,
DevisCVieComponent,
ListeAssureVieComponent,
HistoriqueContratVieAComponent,
ResiliationComponent,
AccountComponent,

  ],
  imports: [
    CommonModule,  
    AgentServiceRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
  ]
})
export class AgentServiceModule { }
