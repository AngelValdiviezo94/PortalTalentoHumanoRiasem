import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { WebcamInitError } from 'ngx-webcam';
import { RequestMarcacionWeb, ResponseMarcacionWeb } from 'src/app/models/marcaciones/marcaciones';
import { ResponseModel } from 'src/app/models/response.model';
import { MarcacionService } from 'src/app/services/marcacion.service';
import Swal from 'sweetalert2';
import { ModalRegistroAsistenciaComponent } from '../registro-asistencia/modal-registro-asistencia/modal-registro-asistencia.component';
import { ModalRegistroAsistenciaFacialComponent } from './modal-registro-asistencia-facial/modal-registro-asistencia-facial.component';
import { NgxFullscreenDirective } from '@ultimate/ngx-fullscreen';
import { MantenimientoService } from 'src/app/services/mantenimiento.service';

@Component({
  selector: 'app-registro-asistencia-facial',
  templateUrl: './registro-asistencia-facial.component.html',
  styleUrls: ['./registro-asistencia-facial.component.scss']
})
export class RegistroAsistenciaFacialComponent implements OnInit {
  @ViewChild('inputIdentificacion') inputIdentificacion!: ElementRef;
  @ViewChild('buttonRegistrar') buttonRegistrar!: ElementRef;

  @ViewChild('pantallaRAF') pantallaRAF!: NgxFullscreenDirective;
  @ViewChild('principal') principal!:  ElementRef<Element>;

  identificacion = new FormControl('', [Validators.required, Validators.pattern(/^[0-9]\d*$/)
    , Validators.minLength(10), Validators.maxLength(10)]);

  allowCameraSwitch: boolean = false;
  facingMode: string = 'user';  //Set cámara frontal
  novedadMarcacion: string = '';
  esMovil: boolean = false;
  mostrarCamara: boolean = true;
  colorInputActive: boolean = false;

  constructor(public dialog: MatDialog, private spinner: NgxSpinnerService, private router: Router,
    private marcacionService: MarcacionService, private toaster: ToastrService, private mantenimientoService: MantenimientoService) { }

  ngOnInit(): void {
    this.esMovil = this.esOrigenMobile();
    setTimeout(() => {
      this.inputIdentificacion?.nativeElement?.focus();
      if(this.esMovil)
      this.enterFullscreen();
    }, 200);

    setTimeout(() => {
      this.mostrarCamara = false;
    }, 3500);
  }

  ngOnDestroy() {
    Swal.close();
  }

  GenerarMarcacionWeb(request: RequestMarcacionWeb) {
    this.spinner.show();
    this.marcacionService.GenerarMarcacionWeb(request)
      .subscribe({
        next: (resp: ResponseModel) => {
          if (resp.succeeded) {
            let marcacion: ResponseMarcacionWeb = resp.data;
            let dialogRef = this.dialog.open(ModalRegistroAsistenciaComponent,
              { data: marcacion, closeOnNavigation: true, autoFocus: false, width: '800px', exitAnimationDuration: '600ms' });

            dialogRef.afterOpened().subscribe(result => {
              this.borrarTodo();
            });
          } else {
            this.novedadMarcacion = resp.message;
            this.colorInputActive = true;

            setTimeout(() => {
              this.borrarTodo();
              this.novedadMarcacion = '';
              this.colorInputActive = false;
            }, 3000);
            // this.toaster.warning(resp.message);
          }
          this.spinner.hide();
        },
        error: () => {
          this.spinner.hide();
          this.toaster.error('No se pudo establecer la conexión');
        }
      });
  }

  validarCedula(identificacion: string) {
    if (identificacion.length == 10) {
      this.spinner.show();
      this.mantenimientoService.optenerColaboradores('', '', '', identificacion)
        .subscribe(
          (resp) => {
            if(resp.succeeded == true){
              if(resp.data[0].facialPersonId != null){
                let timerInterval: any;
              Swal.fire({
                title: 'Coloque su rostro frente a la cámara',
                html: '<b>3</b> segundos',
                timer: 3000,
                timerProgressBar: true,
                allowOutsideClick: false,
                didOpen: () => {
                  Swal.showLoading()
                  const b = Swal.getHtmlContainer()?.querySelector('b');
                  timerInterval = setInterval(() => {
                    b!.textContent = Math.round(Swal.getTimerLeft()! / 4000)?.toString() || '';
                  }, 6000)
                },
                willClose: () => {
                  clearInterval(timerInterval);
                  let dialogRef = this.dialog.open(ModalRegistroAsistenciaFacialComponent,
                    { data: true, closeOnNavigation: true, autoFocus: false, height: '390px', disableClose: true });

                  dialogRef.afterClosed().subscribe(result => {
                    const request: RequestMarcacionWeb = {
                      identificacionColaborador: this.identificacion.value!,
                      pinColaborador: '',
                      tipoMarcacion: 'F',
                      base64Archivo: result.data,
                      nombreArchivo: this.identificacion.value!,
                      extensionArchivo: 'jpg'
                    };

                    // console.log(result);
                    this.GenerarMarcacionWeb(request);
                  });
                }
              }).then((result) => {
                // if (result.dismiss === Swal.DismissReason.timer) {
                //   console.log('I was closed by the timer')
                // }
              })
              }else{
                this.novedadMarcacion = 'Debes registrar tus datos biométricos';
                this.colorInputActive = true;
                setTimeout(() => {
                  this.borrarTodo();
                  this.novedadMarcacion = '';
                  this.colorInputActive = false;
                }, 3000);
              }
            }else {
              this.novedadMarcacion = resp.message;
              this.colorInputActive = true;

              setTimeout(() => {
                this.borrarTodo();
                this.novedadMarcacion = '';
                this.colorInputActive = false;
              }, 3000);
              // this.toaster.warning(resp.message);
          }
            this.spinner.hide();
          },
          () => {
            this.spinner.hide();
          }
        );
    }
  }

  registrar() {
    if (this.identificacion.valid) {

      this.validarCedula(this.identificacion.value!);

    }
  }

  public handleInitError(error: WebcamInitError): void {
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

    if (error.mediaStreamError && error.mediaStreamError.name === "NotAllowedError") {
      Swal.fire({
        icon: 'info',
        title: 'Conceda los permisos necesarios para el uso de la cámara',
        allowOutsideClick: false,
        // showConfirmButton: false,
      }).then(() => {
        this.router.navigate(['home']);
      });
    }
  }

  numeroBoton(valor: string) {
    this.inputIdentificacion.nativeElement.focus();

    let val = this.getIdentificacion;
    if (val.length < 10) {
      val += valor;
      this.setIdentificacion = val;
    }else if(val.length == 10){
      this.validarCedula(val)
    }
  }

  enter() {
    this.registrar();
  }

  borrarTodo() {
    this.setIdentificacion = '';
    this.identificacion.reset('');
    this.inputIdentificacion.nativeElement.focus();
  }

  esOrigenMobile(): boolean {
    var ua = navigator.userAgent;

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)){
      return true;
    }
    else if (/Chrome/i.test(ua))
      return false;
    else{
      return true;
    }
  }

  get getIdentificacion() {
    return this.identificacion.value || '';
  }

  set setIdentificacion(valor: string) {
    this.identificacion.setValue(valor);
  }

  public get videoOptions(): MediaTrackConstraints {
    const result: MediaTrackConstraints = {};
    if (this.facingMode && this.facingMode !== '') {
      result.facingMode = { ideal: this.facingMode };
    }
    return result;
  }

  async enterFullscreen() {
    // this.pantallaRAF.toggle(this.principal.nativeElement);
    await this.pantallaRAF.toggle();
  }
}
