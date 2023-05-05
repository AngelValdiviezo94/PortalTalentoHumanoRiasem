import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrarSolicitudComponent } from './registrar-solicitud.component';

const routes: Routes = [{ path: '', component: RegistrarSolicitudComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RegistrarSolicitudRoutingModule { }