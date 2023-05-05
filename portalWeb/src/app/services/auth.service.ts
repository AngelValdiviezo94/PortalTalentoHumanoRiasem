import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseModel } from '../models/response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  apiEnrolapp: string = environment.apiEnrolApp;
  apiWorkflow: string = environment.apiWorkflow;

  constructor(private http: HttpClient) { }

  ReenviarActivacion(identificacion: string, correo: string) {
    return this.http.put<ResponseModel>(`${this.apiEnrolapp}/Clientes/ReenviarActivacion?Identificacion=${identificacion}&Correo=${correo}`, []).pipe(catchError(this.errorHandler));
  }

  InfoSuscriptorRestableceContrasena(identificacion: string) {
    return this.http.get<ResponseModel>(`${this.apiEnrolapp}/Clientes/InfoSuscriptorRestableceContrasena/${identificacion}/${false}`).pipe(catchError(this.errorHandler));
  }

  GetClienteByIdentificacion(identificacion: string) {
    return this.http.get<ResponseModel>(`${this.apiEnrolapp}/Clientes/GetClienteByIdentificacion/${identificacion}`).pipe(catchError(this.errorHandler));
  }

  ValidarVersion() {
    return this.http.get<ResponseModel>(`${this.apiWorkflow}/Version/ValidateVersion?versionEco=${environment.versionWeb}&idCanal=${environment.uidCanalWeb}&sistemOperativo=web`).pipe(catchError(this.errorHandler));
  }

  errorHandler(error: any) {
    let errorMessage = '';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }

}
