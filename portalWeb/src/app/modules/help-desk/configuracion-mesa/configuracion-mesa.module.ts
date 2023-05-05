import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfiguracionMesaComponent } from './configuracion-mesa.component';
import { ConfiguracionMesaRoutingModule } from './configuracion-mesa-routing.module';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MaterialExampleModule} from '../../../material.module';// para control de fechas

@NgModule({
  declarations: [
    ConfiguracionMesaComponent
  ],
  imports: [
    CommonModule,
    ConfiguracionMesaRoutingModule,
    MatFormFieldModule,
    MatSortModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MaterialExampleModule,
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'es-EC'},
  ],
})
export class ConfiguracionMesaModule { }

