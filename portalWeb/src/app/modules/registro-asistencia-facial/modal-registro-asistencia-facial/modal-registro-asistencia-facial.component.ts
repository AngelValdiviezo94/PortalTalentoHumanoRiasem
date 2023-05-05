import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-registro-asistencia-facial',
  templateUrl: './modal-registro-asistencia-facial.component.html',
  styleUrls: ['./modal-registro-asistencia-facial.component.scss']
})
export class ModalRegistroAsistenciaFacialComponent implements OnInit {
  private trigger: Subject<void> = new Subject<void>();
  allowCameraSwitch: boolean = false;
  facingMode: string = 'user';  //Set cámara frontal
  existeError: boolean = false;

  constructor(public dialogRef: MatDialogRef<ModalRegistroAsistenciaFacialComponent>, private router: Router) { }

  ngOnInit(): void {
    setTimeout(() => {
      if (!this.existeError)
        setTimeout(() => {
          this.triggerSnapshot();
        }, 2000);
    }, 400);
  }

  ngOnDestroy() {
    Swal.close();
  }

  //#region webcam
  public triggerSnapshot(): void {
    this.trigger.next();
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public handleImage(webcamImage: WebcamImage): void {
    this.dialogRef.close({ data: webcamImage.imageAsBase64 });
  }

  public handleInitError(error: WebcamInitError): void {
    this.existeError = true;
    if (error.mediaStreamError && error.mediaStreamError.name === 'NotFoundError') {
      Swal.fire({
        icon: 'info',
        title: 'No se detectó una cámara, favor conéctela y actualice la página para intentar nuevamente',
        allowOutsideClick: false,
        // showConfirmButton: false
      }).then(() => {
        this.router.navigate(['home']);
      });
    }
  }

  public get videoOptions(): MediaTrackConstraints {
    const result: MediaTrackConstraints = {};
    if (this.facingMode && this.facingMode !== '') {
      result.facingMode = { ideal: this.facingMode };
    }
    return result;
  }
  //#endregion

}
