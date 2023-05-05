import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroAsistenciaComponent } from './registro-asistencia.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialExampleModule } from 'src/app/material.module';
import { RegistroAsistenciaRoutingModule } from './registro-asistencia-routing.module';
import { ModalRegistroAsistenciaComponent } from './modal-registro-asistencia/modal-registro-asistencia.component';

@NgModule({
  declarations: [
    RegistroAsistenciaComponent,
    ModalRegistroAsistenciaComponent
  ],
  imports: [
    CommonModule,
    RegistroAsistenciaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialExampleModule
  ]
})
export class RegistroAsistenciaModule { }
