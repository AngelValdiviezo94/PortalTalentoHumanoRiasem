import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ServicioAyudaUbicacionComponent } from './servicio-ayuda-ubicacion.component';

const routes: Routes = [{ path: '', component: ServicioAyudaUbicacionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ServicioAyudaUbicacionRoutingModule { }
