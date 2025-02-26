import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccueilComponent } from './accueil/accueil.component';  // Assurez-vous que les composants sont importés
import { AssuranceVieComponent } from './assurance-vie/assurance-vie.component';
import { AssuranceAutoComponent } from './assurance-auto/assurance-auto.component';

const routes: Routes = [
  { path: '', redirectTo: '/accueil', pathMatch: 'full' }, // Redirection vers 'accueil' par défaut
  { path: 'accueil', component: AccueilComponent },
  { path: 'assurance-vie', component: AssuranceVieComponent },
  { path: 'assurance-auto', component: AssuranceAutoComponent },
  { path: 'espace-client', loadChildren: () => import('./espace-client/espace-client.module').then(m => m.EspaceClientModule) } // Lazy loading du module
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
