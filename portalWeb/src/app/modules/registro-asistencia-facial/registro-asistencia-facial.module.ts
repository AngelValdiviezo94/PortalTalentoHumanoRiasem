import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroAsistenciaFacialComponent } from './registro-asistencia-facial.component';
import { RegistroAsistenciaFacialRoutingModule } from './registro-asistencia-facial-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialExampleModule } from 'src/app/material.module';
import { WebcamModule } from 'ngx-webcam';
import { ModalRegistroAsistenciaFacialComponent } from './modal-registro-asistencia-facial/modal-registro-asistencia-facial.component';
import { NgxFullscreenModule } from '@ultimate/ngx-fullscreen';


@NgModule({
  declarations: [
    RegistroAsistenciaFacialComponent,
    ModalRegistroAsistenciaFacialComponent
  ],
  imports: [
    CommonModule,
    RegistroAsistenciaFacialRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialExampleModule,
    WebcamModule,
    NgxFullscreenModule
  ]
})
export class RegistroAsistenciaFacialModule { }
