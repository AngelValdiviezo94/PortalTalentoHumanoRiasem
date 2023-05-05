import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocPreviewConfig } from 'img-pdf-viewer';

@Component({
  selector: 'app-modal-archivo-adjunto-justificacion',
  templateUrl: './modal-archivo-adjunto-justificacion.component.html',
  styleUrls: ['./modal-archivo-adjunto-justificacion.component.scss']
})
export class ModalArchivoAdjuntoJustificacionComponent implements OnInit {
  mostrarImagen: boolean = false;
  url: string = '';

  constructor(public dialogRef: MatDialogRef<ModalArchivoAdjuntoJustificacionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string) {
    this.url = `https://imagenes.enrolapp.ec/${this.data}`;
  }

  async ngOnInit() {
    let ext = this.getUrlExtension(this.url);

    this.mostrarImagen = ext === 'pdf' ? false : true;

    if (!this.mostrarImagen) {
      window?.open(this.url);
      this.dialogRef.close();
    }
  }

  getUrlExtension(url: string) {
    return url?.split(/[#?]/)[0]?.split('.')?.pop()?.trim();
  }

  docPreviewConfig: DocPreviewConfig = {
    zoomIn: false,
    zoomOut: false,
    rotate: false,
    download: false,
    openModal: false,
    close: false,
    docScreenWidth: '75%',
    modalSize: 'xl',
    zoomIndicator: false,
  };

}