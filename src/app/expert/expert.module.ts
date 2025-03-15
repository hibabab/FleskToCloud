import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpertRoutingModule } from './expert-routing.module';
import { ExpertComponent } from './expert.component';
import { DehasbortComponent } from './dehasbort/dehasbort.component';


@NgModule({
  declarations: [
    ExpertComponent,
    DehasbortComponent
  ],
  imports: [
    CommonModule,
    ExpertRoutingModule
  ]
})
export class ExpertModule { }
