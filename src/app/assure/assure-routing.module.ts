import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { AceuilComponent } from './aceuil/aceuil.component';
import { DeviComponent } from './devi/devi.component';
import { CreationContratComponent } from './creation-contrat/creation-contrat.component';
import { ConstatListComponent } from './constat-list/constat-list.component';
import { ConstatComponent } from './constat/constat.component';
import { CASemstrielComponent } from './casemstriel/casemstriel.component';
import { RenouvellementCAComponent } from './renouvellement-ca/renouvellement-ca.component';
import { InterfaceComponent } from './interface/interface.component';
import { MesCAComponent } from './mes-ca/mes-ca.component';
import { PaymentStatusComponent } from './payment/payment-status/payment-status.component';
import { PaymentFailureComponent } from './payment/payment-failure/payment-failure.component';
import { PaymentSuccessComponent } from './payment/payment-success/payment-success.component';
import { PaymentInitiateComponent } from './payment/payment-initiate/payment-initiate.component';
import { NotificationComponent } from './notification/notification.component';
import { MesReCuComponent } from './mes-re-cu/mes-re-cu.component';
import { DevisAvieComponent } from './devis-avie/devis-avie.component';

const routes: Routes = [
  { path: 'account', component: AccountComponent },
  { path: 'change-password', component: ChangePasswordComponent },
  { path: 'aceuil', component: AceuilComponent },
  { path: 'contrat/:id/payment', component: PaymentInitiateComponent },
  { path: 'payment/success', component: PaymentSuccessComponent },
  { path: 'payment/failure', component: PaymentFailureComponent },
  { path: 'contrat/:id/payment-status', component: PaymentStatusComponent },
  { path: 'MesCA', component:MesCAComponent },
  { path: 'souscription-auto', component:CreationContratComponent },
  { path: 'mesRecu', component:MesReCuComponent },
  { path: 'interface', component:InterfaceComponent },
  { path: 'devisVie', component:DevisAvieComponent },
  { path: 'NCA', component:RenouvellementCAComponent },
  { path: 'SmestrielCA', component:CASemstrielComponent },
  { path: '', redirectTo: '/dashboard-assure/aceuil', pathMatch: 'full' },
    { path: 'devi', component: DeviComponent },
    { path: 'etape1', component:DeviComponent  },
    { path: 'etape2', component:DeviComponent },
    { path: 'etape3', component:DeviComponent },

    { path: 'declarer constat', component: ConstatComponent },
    { path: 'constat', component:ConstatListComponent },
    {path:'notification',component:NotificationComponent}  ,]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssureRoutingModule { }
