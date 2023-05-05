import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from 'src/app/helper/token.service';
import { ResponseModel } from 'src/app/models/response.model';
import { ProspectoService } from 'src/app/services/prospecto.service';
import { patternValidator, passwordMatchValidator } from '../formulario';

@Component({
  selector: 'app-cambio-contrasena',
  templateUrl: './cambio-contrasena.component.html',
  styleUrls: ['./cambio-contrasena.component.scss']
})
export class CambioContrasenaComponent implements OnInit {
  fourthFormGroup!: FormGroup;
  ocultar: boolean = true;
  ocultar1: boolean = true;
  ocultar2: boolean = true;

  constructor(private prospectoService: ProspectoService,private toast:ToastrService,private fb: FormBuilder,private spinner: NgxSpinnerService,private router: Router,private tokenService: TokenService,) { }

  ngOnInit(): void {
    this.fourthFormGroup = this.fb.group(
      {
        contrasenaActual: ['',Validators.compose([Validators.required])],
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
        confirmarcontrasena: ['',Validators.compose([Validators.required])],
      },
      {
        validator: passwordMatchValidator,
      }
    );
  }

  cambiarContrasena(){
    this.spinner.show();
    this.prospectoService.cambiarContrasena(this.tokenService.getIdentificacion(),this.fourthFormGroup.get('contrasenaActual')?.value,this.fourthFormGroup.get('contrasena')?.value).subscribe(
      (resp:ResponseModel)=>{
        if(resp.succeeded){
          this.toast.success(resp.message);
          this.router.navigate(['/login']);
        }else{
          this.toast.error(resp.message);
        }
        this.spinner.hide();
      },()=>{
        this.spinner.hide();
      }
    )
  }

  mostrarPassword() {
    this.ocultar = !this.ocultar;
  }

  mostrarPassword1() {
    this.ocultar1 = !this.ocultar1;
  }

  mostrarPassword2() {
    this.ocultar2 = !this.ocultar2;
  }

}
