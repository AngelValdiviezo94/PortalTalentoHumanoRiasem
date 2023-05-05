import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SoporteComponent } from './soporte.component';

const routes: Routes = [{ path: '', component: SoporteComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SoporteRoutingModule { }
