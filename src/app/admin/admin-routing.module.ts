import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { DehasbortComponent } from './dehasbort/dehasbort.component';
import { InterfaceAdminComponent } from './interface-admin/interface-admin.component';
import { UserListComponent } from './user-list/user-list.component';
import { ExpertFormComponent } from './expert-form/expert-form.component';
import { AgentServiceFormComponent } from './agent-service-form/agent-service-form.component';
import { ListExpertComponent } from './expert-list/expert-list.component';


const routes: Routes = [ { path: '', component: DehasbortComponent } ,
  { path: 'interface', component: InterfaceAdminComponent },
  { path: 'listUser', component: UserListComponent },
  { path: 'Expert', component: ExpertFormComponent },
  {
    path: 'agent-service',
    component: AgentServiceFormComponent
  },
  { path: 'listExpert', component: ListExpertComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
