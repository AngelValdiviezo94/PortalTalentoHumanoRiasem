import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RolDePagoRoutingModule } from './rol-de-pago-routing.module';
import { RolDePagoComponent } from './rol-de-pago.component';


@NgModule({
  declarations: [
    RolDePagoComponent
  ],
  imports: [
    CommonModule,
    RolDePagoRoutingModule
  ]
})
export class RolDePagoModule { }
