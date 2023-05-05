import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SolicitudesRoutingModule } from './solicitudes-routing.module';
import { SolicitudesComponent } from './solicitudes.component';
import { MaterialExampleModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';



@NgModule({
  declarations: [
    SolicitudesComponent
  ],
  imports: [
    CommonModule,
    SolicitudesRoutingModule,
    MaterialExampleModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
  ]
})
export class SolicitudesModule { }
