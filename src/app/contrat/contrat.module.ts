import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContratRoutingModule } from './contrat-routing.module';
import { DeviComponent } from './devi/devi.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    DeviComponent
  ],
  imports: [
    CommonModule,
    ContratRoutingModule ,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class ContratModule { }
