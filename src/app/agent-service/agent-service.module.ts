import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentServiceRoutingModule } from './agent-service-routing.module';
import { AgentServiceComponent } from './agent-service.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CreationContratComponent } from './creation-contrat/creation-contrat.component';
import { DashbortComponent } from './dashbort/dashbort.component';
import { ContratAutoComponent } from './contrat-auto/contrat-auto.component';


@NgModule({
  declarations: [
    AgentServiceComponent,
CreationContratComponent,
DashbortComponent,
ContratAutoComponent
  ],
  imports: [
    CommonModule,        // Use CommonModule instead of BrowserModule in feature modules
    AgentServiceRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
  ]
})
export class AgentServiceModule { }
