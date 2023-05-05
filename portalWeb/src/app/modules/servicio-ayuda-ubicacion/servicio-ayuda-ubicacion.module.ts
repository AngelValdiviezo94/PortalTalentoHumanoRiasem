import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ServicioAyudaUbicacionRoutingModule } from './servicio-ayuda-ubicacion-routing.module';
import { ServicioAyudaUbicacionComponent } from './servicio-ayuda-ubicacion.component';


@NgModule({
  declarations: [
    ServicioAyudaUbicacionComponent
  ],
  imports: [
    CommonModule,
    ServicioAyudaUbicacionRoutingModule
  ]
})
export class ServicioAyudaUbicacionModule { }
