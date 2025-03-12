import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './accueil.component';
import { AutoComponent } from './auto/auto.component';
import { AssistanceComponent } from './assistance/assistance.component';
import { AboutComponent } from './about/about.component';
import { AssuranceVieComponent } from './assurance-vie/assurance-vie.component';

const routes: Routes = [{ path: '', component: AccueilComponent },
   { path: 'auto', component:AutoComponent  },
   { path: 'assistance', component:AssistanceComponent  },
   { path: 'about', component:AboutComponent  },
   { path: 'vie', component:AssuranceVieComponent  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccueilRoutingModule { }
