import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfiguracionMesaComponent } from './configuracion-mesa.component';

const routes: Routes = [{ path: '', component: ConfiguracionMesaComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfiguracionMesaRoutingModule { }
