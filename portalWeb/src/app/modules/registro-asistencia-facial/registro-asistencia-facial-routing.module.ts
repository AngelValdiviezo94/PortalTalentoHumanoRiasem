import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistroAsistenciaFacialComponent } from './registro-asistencia-facial.component';

const routes: Routes = [{ path: '', component: RegistroAsistenciaFacialComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class RegistroAsistenciaFacialRoutingModule { }