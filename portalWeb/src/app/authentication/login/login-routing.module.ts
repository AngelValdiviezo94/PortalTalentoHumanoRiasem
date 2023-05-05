import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Error404Component } from '../error404/error404.component';
import { LoginComponent } from './login.component';

const routes: Routes = [{ path: '', component: LoginComponent },{
  path: 'error-404',
  component: Error404Component
},];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
