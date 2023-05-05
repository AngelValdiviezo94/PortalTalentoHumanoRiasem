import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecuperarContrasenaRoutingModule } from './recuperar-contrasena-routing.module';
import { RecuperarContrasenaComponent } from './recuperar-contrasena.component';
import { NgxOtpInputModule } from "ngx-otp-input";
import { MaterialExampleModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ArchwizardModule } from 'angular-archwizard';
import { CdTimerModule } from 'angular-cd-timer';


@NgModule({
  declarations: [
    RecuperarContrasenaComponent
  ],
  imports: [
    CommonModule,
    RecuperarContrasenaRoutingModule,
    NgxOtpInputModule,
    MaterialExampleModule,
    ArchwizardModule,
    FormsModule, ReactiveFormsModule,
    CdTimerModule,
  ]
})
export class RecuperarContrasenaModule {}
