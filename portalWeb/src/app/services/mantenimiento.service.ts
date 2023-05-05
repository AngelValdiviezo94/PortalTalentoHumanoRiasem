import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Localidad } from '../models/cliente/colaborador';
import { ResponseModel } from '../models/response.model';

@Injectable({
  providedIn: 'root'
})
export class MantenimientoService {
  apiEnrolapp: string = environment.apiEnrolApp;
  apiEvalcore: string = environment.apiEvalCore;
  constructor(private http: HttpClient) { }

  optenerColaboradores(
    udn: string,
    area: string,
    scosto: string,
    colaborador: String
  ): Observable<ResponseModel> {
    const requestUrl = `${
      this.apiEnrolapp
    }/Clientes/GetListadoColaboradores?codUdn=${udn??''}&codArea=${area??''}&codScc=${scosto??''}&colaborador=${colaborador??''}`;
    return this.http
      .get<ResponseModel>(requestUrl)
      .pipe(catchError(this.errorHandler));
  }

  obtenerLocalidad(): Observable<ResponseModel>{
    const requestUrl = `${
      this.apiEvalcore
    }/Localidad/GetLocalidad`;
    return this.http
      .get<ResponseModel>(requestUrl)
      .pipe(catchError(this.errorHandler));
  }

  actualizarColaborador(idColaborador:string, identificacion:string,idJefe:string,lstLocalidad:any, localidadPrincipal:string,idColaboradorReemplazo:string): Observable<ResponseModel>{
    const requestUrl = `${this.apiEnrolapp}/Clientes/UpdateInfoColaborador`;
    const parametros = {

        'idColaborador': idColaborador,
        'identificacion': identificacion,
        'idJefe': idJefe,
        'lstLocalidad': lstLocalidad,
        'localidadPrincipal': localidadPrincipal,
        'idColaboradorReemplazo': idColaboradorReemplazo
    };
    return this.http
      .put<ResponseModel>(requestUrl,parametros)
      .pipe(catchError(this.errorHandler));
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
