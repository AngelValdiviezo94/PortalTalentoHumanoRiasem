import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { filter } from 'rxjs';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { GestionService } from './helper/gestion.service';
import { TokenService } from './helper/token.service';
import { GlobalService } from './services/global.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'EnrolApp Web';
  isLoginPage: boolean = false;
  isValidToken: boolean = true;
  menu: boolean = false;
  usuario: string = '';
  cargo: string = '';
  version: string = environment.versionWeb;
  // foto: string = '';

  constructor(private cookieService: CookieService, private router: Router, private tokenService: TokenService,
    public gestionService: GestionService, public globalService: GlobalService) {
    router.events.pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.usuario = this.gestionService.obtenerSuscriptorAlias();
        this.cargo = this.gestionService.obtenerSuscriptorCargo();
        // this.foto = environment.apiImagenes + '' + this.gestionService.obtenerSuscriptorFoto();

        if (event.urlAfterRedirects === '/login' || event.urlAfterRedirects === '/terminos-y-condiciones' || event.urlAfterRedirects === '/servicio-ayuda-ubicacion' ||
        event.urlAfterRedirects === '/login/error-404')
          this.globalService.isLoginPage = true;
        else
          this.globalService.isLoginPage = false;

        if (event.urlAfterRedirects === '/home')
          this.globalService.isHomePage = true;
        else
          this.globalService.isHomePage = false;

        globalService.isAuthenticate = tokenService.isValidToken();
      });
  }

  cerrarSesion() {
    Swal.fire({
      title: ' Vas a cerrar sesión, ¿estás seguro?',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      width: 300
    }).then((result: any) => {
      if (result.isConfirmed) {
        localStorage.clear();
        this.cookieService.deleteAll();
        this.router.navigate(['/login']);
      }
    });
  }

  home() {
    this.router.navigate(['/home']);
  }

}
