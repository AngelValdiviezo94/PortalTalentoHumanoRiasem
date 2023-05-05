import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReenviarActivacionComponent } from './reenviar-activacion.component';
import { ReenviarActivacionRoutingModule } from './reenviar-activacion-routing.module';
import { ArchwizardModule } from 'angular-archwizard';
import { MaterialExampleModule } from 'src/app/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ReenviarActivacionComponent
  ],
  imports: [
    CommonModule,
    ReenviarActivacionRoutingModule,
    ArchwizardModule,
    MaterialExampleModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ReenviarActivacionModule { }
