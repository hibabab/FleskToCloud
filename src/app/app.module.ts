import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule, provideHttpClient } from '@angular/common/http';
import { AccueilComponent } from './accueil/accueil.component';
import { AssuranceVieComponent } from './assurance-vie/assurance-vie.component';
import { AssuranceAutoComponent } from './assurance-auto/assurance-auto.component';

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
    HttpClientModule
  ],
  providers: [
    provideHttpClient()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
