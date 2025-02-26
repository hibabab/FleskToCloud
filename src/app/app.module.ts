import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { AccueilComponent } from './accueil/accueil.component';
import { AssuranceVieComponent } from './assurance-vie/assurance-vie.component';
import { AssuranceAutoComponent } from './assurance-auto/assurance-auto.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ContratModule } from './contrat/contrat.module';

@NgModule({
  declarations: [
    AppComponent,
    AccueilComponent,
    AssuranceVieComponent,
    AssuranceAutoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ContratModule
  ],
  providers: [
    provideHttpClient(),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
