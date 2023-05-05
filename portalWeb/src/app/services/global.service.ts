import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class GlobalService {
    isLoginPage: boolean = false;
    isAuthenticate: boolean = false;
    isHomePage: boolean = false;
}