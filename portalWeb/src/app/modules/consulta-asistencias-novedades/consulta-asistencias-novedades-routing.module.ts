import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConsultaAsistenciasNovedadesComponent } from './consulta-asistencias-novedades.component';

const routes: Routes = [{ path: '', component: ConsultaAsistenciasNovedadesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConsultaAsistenciasNovedadesRoutingModule { }