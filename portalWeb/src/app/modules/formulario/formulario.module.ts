import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormularioComponent, modalImagen } from './formulario.component';
import { ArchwizardModule } from 'angular-archwizard';
import { FormularioRoutingModule } from './formulario-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';
import { DocumentoDirective } from 'src/app/directives/documento.directive';
import {DialogOverviewExampleDialog} from './formulario.component';
import { MaterialExampleModule } from 'src/app/material.module';
import { CdTimerModule } from 'angular-cd-timer';
import { NgxOtpInputModule } from "ngx-otp-input";
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { ApiService } from 'src/app/services/api.service';
import { ImageCropperModule } from 'ngx-image-cropper';
import {WebcamModule} from 'ngx-webcam';

@NgModule({
  declarations: [
    FormularioComponent,
    DocumentoDirective,
    DialogOverviewExampleDialog,
    modalImagen
  ],
  imports: [
    CommonModule,
    FormularioRoutingModule,
    ArchwizardModule,
    FormsModule, ReactiveFormsModule,
    NgbModule,
    SweetAlert2Module,
    NgSelectModule,
    MaterialExampleModule,
    CdTimerModule,
    NgxOtpInputModule,
    GooglePlaceModule,
    ImageCropperModule,
    WebcamModule
  ],
  providers:[
    ApiService
  ]
})
export class FormularioModule { }
