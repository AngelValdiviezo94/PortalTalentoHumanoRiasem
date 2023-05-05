import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HelpDeskRoutingModule } from './help-desk-routing.module';
import { HelpDeskComponent } from './help-desk.component';
import { MatSortModule } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

@NgModule({
  declarations: [
    HelpDeskComponent
  ],
  imports: [
    CommonModule,
    HelpDeskRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule
  ],
  providers: [
    {provide: MAT_DATE_LOCALE, useValue: 'es-EC'},
  ],
})
export class HelpDeskModule { }
