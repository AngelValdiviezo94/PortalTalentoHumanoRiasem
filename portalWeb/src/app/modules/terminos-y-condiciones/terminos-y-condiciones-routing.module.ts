import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TerminosYCondicionesComponent } from './terminos-y-condiciones.component';

const routes: Routes = [{ path: '', component: TerminosYCondicionesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TerminosYCondicionesRoutingModule { }
