import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ResponseMarcacionWeb } from 'src/app/models/marcaciones/marcaciones';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-modal-registro-asistencia',
  templateUrl: './modal-registro-asistencia.component.html',
  styleUrls: ['./modal-registro-asistencia.component.scss']
})
export class ModalRegistroAsistenciaComponent implements OnInit {
  apiImagenes: string = environment.apiImagenes;
  fotoPerfil: string;

  constructor(@Inject(MAT_DIALOG_DATA) public info: ResponseMarcacionWeb, public dialog: MatDialog) {
    this.fotoPerfil = this.apiImagenes + info.fotoPerfil;
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.dialog.closeAll();
    }, 5000);
  }

}
