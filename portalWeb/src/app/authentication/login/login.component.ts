import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProspectoService } from 'src/app/services/prospecto.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from "ngx-spinner";
import { CargoService } from 'src/app/services/cargo.service';
import { GestionService } from 'src/app/helper/gestion.service';
import { TokenService } from 'src/app/helper/token.service';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from 'src/app/services/auth.service';
import { ResponseModel } from 'src/app/models/response.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup | any;
  ocultar: boolean = true;
  version: string = environment.versionWeb;

  constructor(private prospectoservice: ProspectoService, private fb: FormBuilder, private cookieService: CookieService,
    private cargoService: CargoService, private toaster: ToastrService, public router: Router, private authService: AuthService,
    private spinner: NgxSpinnerService, private gestionService: GestionService, private tokenService: TokenService) {
    this.loginForm = this.fb.group({
      identificacion: ['', [Validators.required, Validators.minLength(10)]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    localStorage.clear();
    this.cookieService.deleteAll();
  }

  login(identificacion: string, password: string) {
    this.validaSuscriptor(identificacion, password);
  }

  validaSuscriptor(identificacion: string, password: string) {
    this.spinner.show();

    this.authService.GetClienteByIdentificacion(identificacion)
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded && resp.statusCode === '000') {
          this.validaLogin(identificacion, password);
        } else if (resp.statusCode === '001' && resp.message.toLowerCase().includes('activa')) {
          let otpInterna = Math.floor(1000 + Math.random() * 9000);
          this.cookieService.set(environment.otpInternaActivacion, otpInterna.toString());
          this.router.navigate(['/reenviar-activacion'], { queryParams: { identificacion, oi: otpInterna } });
        } else {
          this.spinner.hide();
          this.toaster.warning(resp.message, 'Información');
        }
      }, () => { this.spinner.hide() });
  }

  validaLogin(identificacion: string, password: string) {
    this.spinner.show();

    this.prospectoservice.validarLogin(identificacion, password)
      .subscribe(resp => {
        if (resp.succeeded && resp.statusCode === '100') {
          localStorage.setItem(environment.tokenName, resp.data);
          this.cargoService.obtenerInfoCargoSuscriptor(this.tokenService.getIdentificacion())
            .subscribe(resCar => {
              if (resCar.succeeded) {
                this.toaster.success('¡Bienvenido!');
                this.gestionService.guardaInfoCargoSuscriptorLocal(resCar.data);
                this.gestionService.guardaSuscriptorUidLocal(resCar.data?.id);
                this.gestionService.guardaSuscriptorAlias(resCar.data?.nombreUsuario);
                this.gestionService.guardaSuscriptorCargo(resCar.data?.cargoNombre);
                this.gestionService.guardaSuscriptorFoto(resCar.data?.fotoPerfil);
                this.router.navigate(['/home']);
              } else {
                this.toaster.warning(resCar.message, 'Información');
                localStorage.clear();
              }
              this.spinner.hide();
            }, () => {
              localStorage.clear();
              this.spinner.hide();
              this.toaster.error('No se pudo establecer la conexión');
            });
        } else {
          this.spinner.hide();
          this.toaster.warning(resp.message, 'Información');
        }
      }, () => {
        localStorage.clear();
        this.spinner.hide();
        this.toaster.error('No se pudo establecer la conexión');
      });
  }

  mostrarPassword() {
    this.ocultar = !this.ocultar;
  }

}
