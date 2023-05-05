import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestionSolicitudComponent } from './gestion-solicitud.component';

const routes: Routes = [{ path: '', component: GestionSolicitudComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GestionSolicitudRoutingModule { }