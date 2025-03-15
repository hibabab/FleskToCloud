import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DehasbortComponent } from './dehasbort/dehasbort.component';

const routes: Routes = [ { path: '', component: DehasbortComponent } ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExpertRoutingModule { }
