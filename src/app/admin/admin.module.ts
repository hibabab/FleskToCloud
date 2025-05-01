import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { DehasbortComponent } from './dehasbort/dehasbort.component';
import { InterfaceAdminComponent } from './interface-admin/interface-admin.component';
import { UserListComponent } from './user-list/user-list.component';
import { MatIconModule } from '@angular/material/icon';
import { ExpertFormComponent } from './expert-form/expert-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgentServiceFormComponent } from './agent-service-form/agent-service-form.component';
import {  ListExpertComponent } from './expert-list/expert-list.component';
import { ListAgentServiceComponent } from './list-agent-service/list-agent-service.component';
import { ChangePasswordComponent } from './change-password/change-password.component';


@NgModule({
  declarations: [
    AdminComponent,
    DehasbortComponent,
    InterfaceAdminComponent,
    UserListComponent,
    ExpertFormComponent,
    AgentServiceFormComponent,
    ListExpertComponent,
    ListAgentServiceComponent,
    ChangePasswordComponent,
  ],
  imports: [
    FormsModule,
    CommonModule,
    AdminRoutingModule,
    MatIconModule,
    ReactiveFormsModule,


  ]
})
export class AdminModule { }
