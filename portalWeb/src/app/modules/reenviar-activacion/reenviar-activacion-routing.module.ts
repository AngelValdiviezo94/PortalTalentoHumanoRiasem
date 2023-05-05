import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReenviarActivacionComponent } from './reenviar-activacion.component';

const routes: Routes = [{ path: '', component: ReenviarActivacionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReenviarActivacionRoutingModule { }