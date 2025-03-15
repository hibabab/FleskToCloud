import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DehasbortComponent } from '../agentService/dehasbort/dehasbort.component';


const routes: Routes = [ { path: '', component: DehasbortComponent } ];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AgentServiceRoutingModule { }
