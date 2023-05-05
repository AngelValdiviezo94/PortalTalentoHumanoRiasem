import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RolDePagoComponent } from './rol-de-pago.component';

const routes: Routes = [{ path: '', component: RolDePagoComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RolDePagoRoutingModule { }
