import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultaAsistenciasNovedadesComponent } from './consulta-asistencias-novedades.component';
import { ConsultaAsistenciasNovedadesRoutingModule } from './consulta-asistencias-novedades-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialExampleModule } from 'src/app/material.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [
    ConsultaAsistenciasNovedadesComponent
  ],
  imports: [
    CommonModule,
    ConsultaAsistenciasNovedadesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialExampleModule,
    NgbModule,
    NgSelectModule
  ]
})
export class ConsultaAsistenciasNovedadesModule { }
