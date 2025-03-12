import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './accueil.component';
import { AutoComponent } from './auto/auto.component';

const routes: Routes = [{ path: '', component: AccueilComponent },
   { path: 'auto', component:AutoComponent  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccueilRoutingModule { }
