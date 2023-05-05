import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogMedico,GestionSolicitudComponent } from './gestion-solicitud.component';
import { MaterialExampleModule } from '../../material.module';
import { GestionSolicitudRoutingModule } from './gestion-solicitud-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModalArchivoAdjuntoJustificacionComponent } from './modal-archivo-adjunto-justificacion/modal-archivo-adjunto-justificacion.component';
import { ImgPdfViewerModule } from 'img-pdf-viewer';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  declarations: [
    GestionSolicitudComponent,
    ModalArchivoAdjuntoJustificacionComponent,
    DialogMedico
  ],
  imports: [
    CommonModule,
    GestionSolicitudRoutingModule,
    MaterialExampleModule,
    FormsModule,
    ReactiveFormsModule,
    ImgPdfViewerModule,
    PdfViewerModule
  ]
})
export class GestionSolicitudModule { }
