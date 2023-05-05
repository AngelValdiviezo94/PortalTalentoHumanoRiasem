import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrarSolicitudComponent } from './registrar-solicitud.component';
import { RegistrarSolicitudRoutingModule } from './registrar-solicitud-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { JustificacionRegistrarSolicitudComponent } from './justificacion-registrar-solicitud/justificacion-registrar-solicitud.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { VacacionRegistrarSolicitudComponent } from './vacacion-registrar-solicitud/vacacion-registrar-solicitud.component';
import { MaterialExampleModule } from 'src/app/material.module';
import { HorasExtrasRegistrarSolicitudComponent } from './horas-extras-registrar-solicitud/horas-extras-registrar-solicitud.component';

@NgModule({
  declarations: [
    RegistrarSolicitudComponent,
    JustificacionRegistrarSolicitudComponent,
    VacacionRegistrarSolicitudComponent,
    HorasExtrasRegistrarSolicitudComponent
  ],
  imports: [
    CommonModule,
    RegistrarSolicitudRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgSelectModule,
    NgbTimepickerModule,
    NgxDropzoneModule,
    MaterialExampleModule
  ]
})
export class RegistrarSolicitudModule { }
