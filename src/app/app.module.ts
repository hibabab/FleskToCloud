import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';

import { ContratModule } from './contrat/contrat.module';


// Suppression de provideAnimationsAsync et remplacement par BrowserAnimationsModule
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NotificationComponent } from './agent/notification/notification.component';






@NgModule({
  declarations: [
    AppComponent,
    NotificationComponent,
  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule, // Ajout du bon module d'animations
    ContratModule,
  ],
  providers: [
    provideHttpClient(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
