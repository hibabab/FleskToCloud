import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AceuilComponent } from './aceuil/aceuil.component';

const routes: Routes = [
  { path: 'account', component: AccountComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'aceuil', component: AceuilComponent },
  { path: '', redirectTo: '/dashboard-assure/aceuil', pathMatch: 'full' }]
  

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssureRoutingModule { }
