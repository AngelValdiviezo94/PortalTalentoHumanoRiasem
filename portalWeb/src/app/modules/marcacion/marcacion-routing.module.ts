import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MarcacionComponent } from './marcacion.component';

const routes: Routes = [{ path: '', component: MarcacionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MarcacionRoutingModule { }
