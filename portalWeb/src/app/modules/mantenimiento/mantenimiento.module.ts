import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MantenimientoRoutingModule } from './mantenimiento-routing.module';
import { DialogMantenimiento, MantenimientoComponent } from './mantenimiento.component';
import { MaterialExampleModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    MantenimientoComponent, DialogMantenimiento
  ],
  imports: [
    CommonModule,
    MantenimientoRoutingModule,
    MaterialExampleModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    NgSelectModule

  ]
})
export class MantenimientoModule { }
