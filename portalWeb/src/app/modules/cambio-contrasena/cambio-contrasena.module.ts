import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CambioContrasenaRoutingModule } from './cambio-contrasena-routing.module';
import { CambioContrasenaComponent } from './cambio-contrasena.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialExampleModule } from 'src/app/material.module';


@NgModule({
  declarations: [
    CambioContrasenaComponent
  ],
  imports: [
    CommonModule,
    CambioContrasenaRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialExampleModule

  ]
})
export class CambioContrasenaModule { }
