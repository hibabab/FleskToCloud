import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeviComponent } from './devi/devi.component';


const routes: Routes = [
  { path: 'devi', component: DeviComponent },
  { path: 'etape1', component:DeviComponent  },
  { path: 'etape2', component:DeviComponent },
  { path: 'etape3', component:DeviComponent },
  { path: '', redirectTo: 'etape1', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ContratRoutingModule { }
