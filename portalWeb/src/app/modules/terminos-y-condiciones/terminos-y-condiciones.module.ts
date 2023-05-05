import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TerminosYCondicionesRoutingModule } from './terminos-y-condiciones-routing.module';
import { TerminosYCondicionesComponent } from './terminos-y-condiciones.component';


@NgModule({
  declarations: [
    TerminosYCondicionesComponent
  ],
  imports: [
    CommonModule,
    TerminosYCondicionesRoutingModule
  ]
})
export class TerminosYCondicionesModule { }
