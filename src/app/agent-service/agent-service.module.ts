import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgentServiceRoutingModule } from './agent-service-routing.module';
import { AgentServiceComponent } from './agent-service.component';


@NgModule({
  declarations: [
    AgentServiceComponent
  ],
  imports: [
    CommonModule,
    AgentServiceRoutingModule
  ]
})
export class AgentServiceModule { }
