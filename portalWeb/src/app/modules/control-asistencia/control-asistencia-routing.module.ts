import { NgModule, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { startOfMonth } from 'date-fns';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { FeatureService } from 'src/app/helper/feature.service';
import { MarcacionService } from 'src/app/services/marcacion.service';
import { ControlAsistenciaComponent } from './control-asistencia.component';
import { catchError, map, startWith } from 'rxjs/operators';
const routes: Routes = [{ path: '', component: ControlAsistenciaComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControlAsistenciaRoutingModule{

}
