import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { TokenService } from '../helper/token.service';

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private tokenService: TokenService) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        if (this.tokenService.isValidToken()) {
            if (this.tokenService.isTokenExpired()) {
                this.router.navigateByUrl('/login');
                return false;
            } else
                return true;
        } else {
            this.router.navigateByUrl('/login');
            return false;
        }
    }

}