import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccueilRoutingModule } from './accueil-routing.module';
import { AccueilComponent } from './accueil.component';
import { AssuranceVieComponent } from './assurance-vie/assurance-vie.component';
import { AutoComponent } from './auto/auto.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { AssistanceComponent } from './assistance/assistance.component';
import { DevisCVieEpComponent } from './devis-cvie-ep/devis-cvie-ep.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AccueilComponent,
    AssuranceVieComponent,
    AutoComponent,
    AboutComponent,
    ContactComponent,
    AssistanceComponent,
    DevisCVieEpComponent
  ],
  imports: [
    ReactiveFormsModule,
      FormsModule,
    CommonModule,
    AccueilRoutingModule
  ]
})
export class AccueilModule { }
