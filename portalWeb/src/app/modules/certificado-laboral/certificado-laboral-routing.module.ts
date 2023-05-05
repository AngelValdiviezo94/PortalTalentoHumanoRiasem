import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CertificadoLaboralComponent } from './certificado-laboral.component';

const routes: Routes = [{ path: '', component: CertificadoLaboralComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CertificadoLaboralRoutingModule { }
