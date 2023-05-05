import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { RequestMarcacionWeb, ResponseMarcacionWeb } from 'src/app/models/marcaciones/marcaciones';
import { ResponseModel } from 'src/app/models/response.model';
import { MarcacionService } from 'src/app/services/marcacion.service';
import { ModalRegistroAsistenciaComponent } from './modal-registro-asistencia/modal-registro-asistencia.component';

@Component({
  selector: 'app-registro-asistencia',
  templateUrl: './registro-asistencia.component.html',
  styleUrls: ['./registro-asistencia.component.scss']
})
export class RegistroAsistenciaComponent implements OnInit {
  @ViewChild('inputIdentificacion') inputIdentificacion!: ElementRef;
  @ViewChild('inputPin') inputPin!: ElementRef;
  @ViewChild('buttonRegistrar') buttonRegistrar!: ElementRef;

  identificacion = new FormControl('', [Validators.required, Validators.pattern(/^[0-9]\d*$/)
    , Validators.minLength(10), Validators.maxLength(10)]);
  pin = new FormControl('', Validators.required);

  actualFocus: number = 1;

  novedadMarcacion: string = '';
  ocultar: boolean = true;
  esMovil: boolean = false;

  constructor(public dialog: MatDialog, private marcacionService: MarcacionService,
    private toaster: ToastrService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.esMovil = this.esOrigenMobile();
    setTimeout(() => {
      this.inputIdentificacion?.nativeElement?.focus();
      this.actualFocus = 1;
    }, 200);
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
            setTimeout(() => {
              this.novedadMarcacion = '';
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

  inputPinNavigate() {
    this.inputPin.nativeElement.focus();
    this.actualFocus = 2;
  }

  registrar() {
    this.buttonRegistrar.nativeElement.focus();
    this.actualFocus = 3;

    if (this.identificacion.valid && this.pin.valid) {
      const request: RequestMarcacionWeb = {
        identificacionColaborador: this.identificacion.value!,
        pinColaborador: this.pin.value!,
        tipoMarcacion: 'P',
        base64Archivo: '',
        nombreArchivo: '',
        extensionArchivo: ''
      };

      this.GenerarMarcacionWeb(request);
    }
  }

  numeroBoton(valor: string) {
    if (this.getFocus === 2) {
      let val = this.getPin;
      val += valor;
      this.setPin = val;
    } else {
      this.actualFocus = 1;
      this.inputIdentificacion.nativeElement.focus();

      let val = this.getIdentificacion;
      if (val.length < 10) {
        val += valor;
        this.setIdentificacion = val;
      }
    }
  }

  enter() {
    let focus = this.getFocus;

    if (focus === 1) {
      this.inputPin.nativeElement.focus();
      this.actualFocus = 2;
      return;
    }

    if (focus === 2) {
      this.buttonRegistrar.nativeElement.focus();
      this.actualFocus = 3;
      this.registrar();
      return;
    }

    this.inputIdentificacion.nativeElement.focus();
    this.actualFocus = 1;
  }

  borrarTodo() {
    this.setIdentificacion = '';
    this.identificacion.markAsUntouched();
    this.setPin = '';
    this.pin.markAsUntouched();
    this.inputIdentificacion.nativeElement.focus();
    this.actualFocus = 1;
  }

  esOrigenMobile(): boolean {
    var ua = navigator.userAgent;

    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua))
      return true;
    else if (/Chrome/i.test(ua))
      return false;
    else
      return true;
  }

  get getIdentificacion() {
    return this.identificacion.value || '';
  }

  set setIdentificacion(valor: string) {
    this.identificacion.setValue(valor);
  }

  get getPin() {
    return this.pin.value || '';
  }

  set setPin(valor: string) {
    this.pin.setValue(valor);
  }

  get getFocus() {
    return this.actualFocus;
  }

  set setFocus(valor: number) {
    this.actualFocus = valor;
  }
}