import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrackingNavegacionComponent } from './tracking-navegacion.component';
import { TrackingNavegacionRoutingModule } from './tracking-navegacion-routing.module';
import { MaterialExampleModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    TrackingNavegacionComponent
  ],
  imports: [
    CommonModule,
    TrackingNavegacionRoutingModule,
    MaterialExampleModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class TrackingNavegacionModule { }
