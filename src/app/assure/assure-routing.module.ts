import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AceuilComponent } from './aceuil/aceuil.component';
import { DeviComponent } from './devi/devi.component';
import { CreationContratComponent } from './creation-contrat/creation-contrat.component';
import { ConstatComponent } from './constat/constat.component';
import { ConstatListComponent } from './constat-list/constat-list.component';

const routes: Routes = [
  { path: 'account', component: AccountComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'aceuil', component: AceuilComponent },
  { path: '', redirectTo: '/dashboard-assure/aceuil', pathMatch: 'full' },
   {path:'CreationCA',component:CreationContratComponent},
    { path: 'devi', component: DeviComponent },
    { path: 'etape1', component:DeviComponent  },
    { path: 'etape2', component:DeviComponent },
    { path: 'etape3', component:DeviComponent },
    { path: '', redirectTo: 'etape1', pathMatch: 'full' },
    { path: 'declarer constat', component: ConstatComponent },
    { path: 'constat', component:ConstatListComponent },]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssureRoutingModule { }