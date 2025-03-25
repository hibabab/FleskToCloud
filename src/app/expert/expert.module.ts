import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExpertRoutingModule } from './expert-routing.module';
import { ExpertComponent } from './expert.component';
import { DehasbortExpertComponent } from './dehasbort/dehasbort.component';



@NgModule({
  declarations: [
    ExpertComponent,
    DehasbortExpertComponent
  ],
  imports: [
    CommonModule,
    ExpertRoutingModule
  ]
})
export class ExpertModule { }
