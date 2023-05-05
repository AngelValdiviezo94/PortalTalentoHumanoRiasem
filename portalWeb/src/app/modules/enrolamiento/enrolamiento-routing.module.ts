import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnrolamientoComponent } from './enrolamiento.component';

const routes: Routes = [{ path: '', component: EnrolamientoComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EnrolamientoRoutingModule { }
