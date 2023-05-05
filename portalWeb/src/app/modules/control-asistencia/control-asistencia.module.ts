import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ControlAsistenciaRoutingModule } from './control-asistencia-routing.module';
import { ControlAsistenciaComponent, DialogNovedad, DialogPermisos } from './control-asistencia.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatTableModule} from '@angular/material/table';
import {MaterialExampleModule} from '../../material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {HttpClientModule} from '@angular/common/http';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  declarations: [
    ControlAsistenciaComponent,
    DialogPermisos,
    DialogNovedad,

  ],
  imports: [
    CommonModule,
    ControlAsistenciaRoutingModule,
    NgxDatatableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatInputModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MaterialExampleModule,
    HttpClientModule,
    MatSortModule,
    NgbModule
  ]
})
export class ControlAsistenciaModule { }
