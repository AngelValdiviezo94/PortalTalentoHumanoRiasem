import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EnrolamientoRoutingModule } from './enrolamiento-routing.module';
import { EnrolamientoComponent } from './enrolamiento.component';
import { ToobarComponent } from 'src/app/components/toobar/toobar.component';


@NgModule({
  declarations: [
    EnrolamientoComponent,

  ],
  imports: [
    CommonModule,
    EnrolamientoRoutingModule,
    ToobarComponent
  ]
})
export class EnrolamientoModule { }
