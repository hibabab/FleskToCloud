import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DehasbortExpertComponent } from './dehasbort/dehasbort.component';


const routes: Routes = [ { path: '', component: DehasbortExpertComponent } ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpertRoutingModule { }
