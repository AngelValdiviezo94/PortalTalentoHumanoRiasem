import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarcacionRoutingModule } from './marcacion-routing.module';
import { MarcacionComponent } from './marcacion.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatTableModule} from '@angular/material/table';
import {MaterialExampleModule} from '../../material.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import {HttpClientModule} from '@angular/common/http';
import { MatSortModule } from '@angular/material/sort';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatTableExporterModule } from 'mat-table-exporter';

@NgModule({
  declarations: [
    MarcacionComponent
  ],
  imports: [
    CommonModule,
    MarcacionRoutingModule,
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
    NgbModule,
    MatTableExporterModule
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'es-EC'},
  ],
})
export class MarcacionModule { }

