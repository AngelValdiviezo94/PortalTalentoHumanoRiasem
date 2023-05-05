import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

import { environment } from 'src/environments/environment';
import { ResponseModel } from '../models/response.model'
import { DocAdjunto } from '../models/cliente/colaborador';

@Injectable({
  providedIn: 'root'
})

export class ProspectoService {
  apiAuth: string = environment.apiAuth;
  apiEnrolApp: string = environment.apiEnrolApp;
  apiWorkflow: string = environment.apiWorkflow;
  apiUtils: string = environment.apiUtils;

  constructor(private http: HttpClient) { }

  validarIdentificacion(tipoIdentificacion: string, identificacion: string): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${this.apiEnrolApp}/Prospectos/'C'/${tipoIdentificacion}/${identificacion}`).pipe(catchError(this.errorHandler));
  }

  validarotp(codigo: any, identificacion: String): Observable<ResponseModel> {
    let objeto = {
      codigo: codigo,
      cedula: identificacion
    };
    //console.log(objeto);
    return this.http.post<ResponseModel>(`${this.apiAuth}/Otp/ValidateOtp`, objeto).pipe(catchError(this.errorHandler));
  }

  cambiarContrasena(identificacion: string,contrasenaAnterior: string,contrasenaNueva: string): Observable<ResponseModel> {
    let objeto = {
      identificacion: identificacion,
      contrasenaAnterior: contrasenaAnterior,
      contrasenaNueva: contrasenaNueva
    };
    //console.log(objeto);
    return this.http.put<ResponseModel>(`${this.apiEnrolApp}/Clientes/UpdateContrasenaColaborador`, objeto).pipe(catchError(this.errorHandler));
  }

  reenviarOtp(correo:string,alias:string,identificacion:string,celular:string){
    let objeto = {
      para: correo,
      alias: alias,
      identificacion: identificacion,
      celular: celular,
      asunto: "Reenvío de Código de Seguridad para suscripción de cuenta - EnrolApp"
    };
    //console.log(objeto);
    return this.http.post<ResponseModel>(`${this.apiUtils}/Notificaciones/ReenviarOtp`,objeto).pipe(catchError(this.errorHandler));
  }

  crearCliente(tipoIdentificacion: string, identificacion: string, fechaNacimiento: string, genero: string, direccion: string, latitud: string, longitud: string, correo: string, password: string, dispositivoId: string, imagenPerfil:DocAdjunto): Observable<ResponseModel> {
    let objeto = {
      tipoIdentificacion,
      identificacion,
      genero,
      latitud,
      longitud,
      direccion,
      fechaNacimiento,
      correo,
      password,
      dispositivoId,
      imagenPerfil,
      'tipoCliente': 'C'
    };

    return this.http.post<ResponseModel>(`${this.apiEnrolApp}/Clientes/CreateCliente`, objeto).pipe(catchError(this.errorHandler));
  }

  validarLogin(identificacion: String, contrasena: String): Observable<ResponseModel> {
    let objeto = {
      identificacion,
      password: contrasena
    };

    return this.http.post<ResponseModel>(`${this.apiAuth}/LdapUser/AuthenticateLdapUser`, objeto).pipe(catchError(this.errorHandler));
  }

  obtenerCliente(identificacion: String): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${this.apiEnrolApp}/Empleados/${identificacion}`).pipe(catchError(this.errorHandler));
  }

  informacionRestablecerContrasena(identificacion: String): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${this.apiEnrolApp}/Clientes/InfoSuscriptorRestableceContrasena/${identificacion}/true/`).pipe(catchError(this.errorHandler));
  }

  obtenerEmpleados(uid: string):Observable<ResponseModel>{
    return this.http.get<ResponseModel>(`${this.apiWorkflow}/GetClientesByIdPadre?uid=${uid}`).pipe(catchError(this.errorHandler));
  }

  actualizarColaborador(identificacion:string,password:string): Observable<ResponseModel>{
    let parametros={
      identificacion: identificacion,
      password: password
    };
    return this.http.put<ResponseModel>(`${this.apiEnrolApp}/Clientes/SuscriptorRestableceContrasena`, parametros).pipe(catchError(this.errorHandler));
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
