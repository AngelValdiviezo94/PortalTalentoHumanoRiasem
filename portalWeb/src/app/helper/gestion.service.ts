import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { InfoCargo } from '../models/cargo/cargo.interface';

@Injectable({
    providedIn: 'root'
})

export class GestionService {

    constructor(private cookieService: CookieService) { }

    guardaInfoCargoSuscriptorLocal(infoCargo: InfoCargo): void {
        localStorage.setItem(environment.iCargoCkName, window.btoa(JSON.stringify(infoCargo)));
    }

    obtenerInfoCargoSuscriptorLocal(): InfoCargo {
        let infoCargo;

        try {
            infoCargo = JSON.parse(window.atob(localStorage.getItem(environment.iCargoCkName) || ''));
        } catch (error) {
            infoCargo = {} as InfoCargo;
        }

        return infoCargo;
    }

    guardaSuscriptorUidLocal(uid: string): void {
        this.cookieService.set(environment.uidSuscriptorName, window.btoa(uid));
    }

    obtenerSuscriptorUidLocal(): string {
        return window.atob(this.cookieService.get(environment.uidSuscriptorName) || '');
    }

    guardaSuscriptorAlias(alias: string): void {
        this.cookieService.set(environment.aliasUsuario, window.btoa(alias));
    }

    obtenerSuscriptorAlias(): string {
        return window.atob(this.cookieService.get(environment.aliasUsuario) || '');
    }

    guardaSuscriptorCargo(cargo: string): void {
        this.cookieService.set(environment.cargoUsuario, window.btoa(cargo));
    }

    obtenerSuscriptorCargo(): string {
        return window.atob(this.cookieService.get(environment.cargoUsuario) || '');
    }

    guardaSuscriptorFoto(foto: string): void {
        this.cookieService.set(environment.fotoUsuario, window.btoa(foto));
    }

    // obtenerSuscriptorFoto(): string {
    //     return window.atob(this.cookieService.get(environment.fotoUsuario) || '');
    // }

    obtenerImagenPerfil(): string {
        return environment.apiImagenes + window.atob(this.cookieService.get(environment.fotoUsuario) || '');
    }

}
