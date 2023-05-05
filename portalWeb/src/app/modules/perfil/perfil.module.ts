import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PerfilRoutingModule } from './perfil-routing.module';
import { modalFamiliar, modalImagen, modalMapa, PerfilComponent } from './perfil.component';
import { NgSelectModule } from '@ng-select/ng-select';
import {WebcamModule} from 'ngx-webcam';
import {BrowserModule} from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MaterialExampleModule } from 'src/app/material.module';
import { GooglePlaceModule } from "ngx-google-places-autocomplete";
import { ApiService } from 'src/app/services/api.service';
// import { AgmCoreModule } from '@agm/core';




@NgModule({
  declarations: [
    PerfilComponent,
    modalImagen,
    modalMapa,
    modalFamiliar,

  ],
  imports: [
    // BrowserModule,
    CommonModule,
    PerfilRoutingModule,
    NgbModule,
    NgSelectModule,
    WebcamModule,
    FormsModule,
    ImageCropperModule,
    MaterialExampleModule,
    ReactiveFormsModule,
    GooglePlaceModule,

    // AgmCoreModule

  ],
  providers:[
    ApiService
  ]
})
export class PerfilModule { }
