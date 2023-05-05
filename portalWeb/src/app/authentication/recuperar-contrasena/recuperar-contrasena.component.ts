import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxOtpInputConfig } from 'ngx-otp-input';
import { ToastrService } from 'ngx-toastr';
import { ProspectoService } from 'src/app/services/prospecto.service';
import { verificarCedula } from 'udv-ec';
import { CdTimerComponent, TimeInterface } from 'angular-cd-timer';
import { NgxSpinnerService } from 'ngx-spinner';
import { WizardComponent } from 'angular-archwizard';
import {AbstractControl,FormBuilder,FormControl,FormGroup,ValidationErrors,ValidatorFn,Validators,} from '@angular/forms';
import { Prospecto } from 'src/app/models/prospecto/prospecto.model';
import { patternValidator, passwordMatchValidator } from 'src/app/modules';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recuperar-contrasena',
  templateUrl: './recuperar-contrasena.component.html',
  styleUrls: ['./recuperar-contrasena.component.scss']
})
export class RecuperarContrasenaComponent implements OnInit {
  otpInputConfig: NgxOtpInputConfig = {
    otpLength: 6,
    autofocus: true,
    numericInputMode: true,
    classList: {
      inputBox: 'my-super-box-class',
      input: 'my-super-class',
      inputFilled: 'my-super-filled-class',
      inputDisabled: 'my-super-disable-class',
      inputSuccess: 'my-super-success-class',
      inputError: 'my-super-error-class',
    },
  }
  identificacionM: string='';
  colaborador:any='';
  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  thirdFormGroup!: FormGroup;
  fourthFormGroup!: FormGroup;
  documentoValido: boolean = true;
  tipoDocumento: string = 'c';
  valido: boolean = false;
  reenviar: boolean = false;
  prospecto!: Prospecto;
  ocultar: boolean = true;
  ocultar1: boolean = true;
  @ViewChild('basicTimer', { static: true }) basicTimer!: CdTimerComponent;
  timerInfo = '';
  constructor(private prospectoService: ProspectoService,private toast:ToastrService,private fb: FormBuilder,private spinner: NgxSpinnerService,private router: Router,) { }

  ngOnInit(): void {
    this.firstFormGroup = this.fb.group({
      identificacion: ['', [Validators.required]],
    });
    this.secondFormGroup = this.fb.group({
      otp: ['', [Validators.required]],
    });
    this.fourthFormGroup = this.fb.group(
      {
        contrasena: [
          '',
          Validators.compose([
            Validators.required,
            patternValidator(/\d/, { hasNumber: true }),
            patternValidator(/[A-Z]/, { hasCapitalCase: true }),
            patternValidator(/[a-z]/, { hasSmallCase: true }),
            patternValidator(RegExp('[\u0021-\u002b\u003c-\u0040]'), {
              hasSpecialCharacters: true,
            }),
            Validators.minLength(10),
          ]),
        ],
        confirmarcontrasena: [null, Validators.compose([Validators.required])],
      },
      {
        validator: passwordMatchValidator,
      }
    );
  }


  validarOtp(codigo:string){
    this.prospectoService.validarotp(codigo,this.identificacionM).subscribe((res)=>{
      if(res.succeeded){
        this.toast.success(res.message);
        this.valido=true;
      }else{
        this.toast.error(res.message);
      }
    });
  }

  handeOtpChange(value: string[]): void {
  }

  handleFillEvent(value: string): void {
    this.validarOtp(value);

  }

  myMethod(identificacion: string) {
    if (identificacion.length >= 10) {
      this.documentoValido = true;
      this.identificacionM = identificacion;
      if (this.tipoDocumento === 'c' && !verificarCedula(this.identificacionM)) {
        this.documentoValido = false;
        return;
      }
      this.spinner.show();
      this.prospectoService
        .informacionRestablecerContrasena(this.identificacionM)
        .subscribe((resp) => {
          if (resp.succeeded && resp.statusCode === '000') {
            this.toast.success('¡Genial! continúa al siguiente paso');
            this.colaborador=resp.data;
            this.valido = true;
          } else {
            this.toast.warning(resp.message);
            this.valido = false;
          }
          this.spinner.hide();
        }, () => { this.spinner.hide(); });
    } else {
      this.valido = false;
    }
  }

  onComplete(data: any) {
    data.elt.nativeElement.classList.add("muteCount");
    this.reenviar = true;

  }
  reenviarOtp() {
    this.reenviar = false;
    this.prospectoService.informacionRestablecerContrasena('0951810993').subscribe((resp) => {
      if (resp.succeeded == true) {
        this.toast.success('Se ha reenviado la OTP');
      } else {
        this.toast.error('' + resp.message);
        this.valido = false;
      }
    });
  }


  onTick(data: TimeInterface) {
    this.timerInfo = '';
  }

  onStart(data: any) {
  }

  doActionBasicTimer(action: String) {
    switch (action) {
      case 'start':
        this.basicTimer.start();
        break;
      case 'resume':
        this.basicTimer.resume();
        break;
      case 'reset':
        this.basicTimer.reset();
        break;
      default:
        this.basicTimer.stop();
        break;
    }
  }
  mostrarPassword() {
    this.ocultar = !this.ocultar;
  }

  mostrarPassword1() {
    this.ocultar1 = !this.ocultar1;
  }
  finish(contrasena:string){
    this.spinner.show();
    this.prospectoService.actualizarColaborador(this.identificacionM,contrasena).subscribe(res=>{
      if(res.succeeded==true){
        Swal.fire({
          icon: 'success',
          title: '¡Genial!',
          text:
            'Ya restableciste tu contraseña, ahora puedes iniciar sesión en Enrolapp.',
          confirmButtonColor: '#FE5A00',
        }).then((result: any) => {
          this.router.navigate(['/login']);
        });
      }else{
        this.toast.error('' + res.message);
        this.valido = false;
      }
      this.spinner.hide();
    },()=>{this.spinner.hide()});

  }

}
