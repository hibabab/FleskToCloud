import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';






const routes: Routes = [
  { path: '', redirectTo: '/accueil', pathMatch: 'full' }, // Redirection vers 'accueil' par défaut
  { path: 'contrat', loadChildren: () => import('./contrat/contrat.module').then(m => m.ContratModule) },
  { path: 'espace-client', loadChildren: () => import('./espace-client/espace-client.module').then(m => m.EspaceClientModule) },

  { path: 'accueil', loadChildren: () => import('./accueil/accueil.module').then(m => m.AccueilModule) }, // Lazy loading du module



  { path: 'dashboard-assure', loadChildren: () => import('./assure/assure.module').then(m => m.AssureModule) },
  { path: 'agent', loadChildren: () => import('./agent-service/agent-service.module').then(m => m.AgentServiceModule) },
  { path: 'expert', loadChildren: () => import('./expert/expert.module').then(m => m.ExpertModule) },
  { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
