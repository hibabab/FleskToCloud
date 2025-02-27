import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContratRoutingModule } from './contrat-routing.module';
import { DeviComponent } from './devi/devi.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CreationContratComponent } from './creation-contrat/creation-contrat.component';

@NgModule({
  declarations: [
    DeviComponent,
    CreationContratComponent
  ],
  imports: [
    CommonModule,
    ContratRoutingModule,
    FormsModule,
    ReactiveFormsModule, // Importé ici
    MatIconModule,
  ]
})
export class ContratModule { }
