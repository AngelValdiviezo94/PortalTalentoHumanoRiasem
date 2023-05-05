import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ResponseModel } from 'src/app/models/response.model';
import { AuthService } from 'src/app/services/auth.service';
import { CookieService } from 'ngx-cookie-service';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reenviar-activacion',
  templateUrl: './reenviar-activacion.component.html',
  styleUrls: ['./reenviar-activacion.component.scss']
})
export class ReenviarActivacionComponent implements OnInit {
  infoColaborador: any = [];
  esNuevoCorreo: boolean = false;
  ctrlCorreo = new FormControl();
  identificacion: string = '';

  constructor(private authService: AuthService, private toaster: ToastrService, private cookieService: CookieService,
    private spinner: NgxSpinnerService, private router: Router, private route: ActivatedRoute) {
    this.ctrlCorreo.disable();

    this.route.queryParamMap
      .subscribe((val: any) => {
        let otp = val.params.oi;

        if (otp === undefined || otp !== this.cookieService.get(environment.otpInternaActivacion))
          this.router.navigate(['login']);

        this.cookieService.delete(environment.otpInternaActivacion);
        this.identificacion = val.params.identificacion;
        this.InfoSuscriptorRestableceContrasena(this.identificacion);
      });
  }

  ngOnInit(): void { }

  Reenviar() {
    let identificacion = this.identificacion;
    let nuevoCorreo: string = '';

    if (this.esNuevoCorreo) {
      this.ctrlCorreo.markAsTouched();
      if (this.ctrlCorreo.valid) {
        nuevoCorreo = this.ctrlCorreo.value!
      } else
        return;
    }

    Swal.fire({
      title: '¿ Confirmar acción ?',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      width: 300
    }).then((result: any) => {
      if (result.isConfirmed)
        this.ReenviarActivacion(identificacion, nuevoCorreo);
    });
  }

  ReenviarActivacion(identificacion: string, correo: string) {
    this.spinner.show();
    this.authService.ReenviarActivacion(identificacion, correo)
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded) {
          Swal.fire({
            title: 'Información',
            text: resp.message,
            width: 350
          }).then(() => {
            this.router.navigate(['/login']);
          });
        } else
          this.toaster.warning(resp.message);

        this.spinner.hide();
      }, () => { this.spinner.hide(); });
  }

  InfoSuscriptorRestableceContrasena(identificacion: string) {
    this.spinner.show();

    this.authService.InfoSuscriptorRestableceContrasena(identificacion)
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded) {
          this.infoColaborador = resp.data;
          this.ctrlCorreo.setValue(this.infoColaborador.correo);
        }

        this.spinner.hide();
      }, () => { this.spinner.hide(); });
  }

  changeSlider(value: MatSlideToggleChange) {
    this.esNuevoCorreo = value.checked;

    if (value.checked) {
      this.ctrlCorreo.enable();
      this.ctrlCorreo.setValidators([Validators.required, Validators.email]);
      this.ctrlCorreo.updateValueAndValidity();
    } else {
      this.ctrlCorreo.disable();
      this.ctrlCorreo.clearValidators();
      this.ctrlCorreo.markAsUntouched();
      this.ctrlCorreo.updateValueAndValidity();
    }
  }

}