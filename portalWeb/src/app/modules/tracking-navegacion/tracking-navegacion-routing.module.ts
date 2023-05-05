import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TrackingNavegacionComponent } from './tracking-navegacion.component';

const routes: Routes = [{ path: '', component: TrackingNavegacionComponent }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TrackingNavegacionRoutingModule { }
