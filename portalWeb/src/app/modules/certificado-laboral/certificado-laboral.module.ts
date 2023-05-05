import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CertificadoLaboralRoutingModule } from './certificado-laboral-routing.module';
import { CertificadoLaboralComponent } from './certificado-laboral.component';


@NgModule({
  declarations: [
    CertificadoLaboralComponent
  ],
  imports: [
    CommonModule,
    CertificadoLaboralRoutingModule,
  ]
})
export class CertificadoLaboralModule { }
