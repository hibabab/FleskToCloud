import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EspaceClientRoutingModule } from './espace-client-routing.module';
import { EspaceClientComponent } from './espace-client.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { AssureModule } from '../assure/assure.module';
import { RegisterComponent } from './register/register.component';
import { ConfirmemailComponent } from './confirmemail/confirmemail.component';


@NgModule({
  declarations: [
    EspaceClientComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ConfirmemailComponent
  ],
  imports: [
    CommonModule,
    EspaceClientRoutingModule,
    FormsModule,
    AssureModule
  ]
})
export class EspaceClientModule { }
