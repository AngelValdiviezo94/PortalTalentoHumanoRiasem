import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DocAdjunto } from '../models/cliente/colaborador';
import { ResponseModel } from '../models/response.model'

@Injectable({
  providedIn: 'root'
})
export class CargoService {
  apiWorkflow: string = environment.apiWorkflow;
  apiEnrolapp: string = environment.apiEnrolApp;

  constructor(private http: HttpClient) { }

  obtenerInfoCargoSuscriptor(identificacion: string): Observable<ResponseModel> {
    var parametros = {
      params: new HttpParams()
        .set('identificacion', identificacion)
        .set('uidCanal', environment.uidCanalWeb)
    };

    return this.http.get<ResponseModel>(`${this.apiWorkflow}/Workflow/GetInfoCargoRolColaborador`, parametros).pipe(catchError(this.errorHandler));
  }

  actualizarColaborador(id: string, celular: string, correo: string, direccion: string, latitud: string, longitud: string, adjunto: DocAdjunto): Observable<ResponseModel> {
    var parametros = {
      'id': id,
      'celular': celular,
      'correo': correo,
      'direccion': direccion,
      'latitud': latitud,
      'longitud': longitud,
      'adjunto': adjunto
    };
    // console.log(parametros);
    return this.http.put<ResponseModel>(`${this.apiEnrolapp}/Clientes/UpdateInfoPersonalColaborador`, parametros).pipe(catchError(this.errorHandler));
  }

  ObtenerInfoTrackingFeature(canalId: string, featureId: string, colaborador: string, fechaDesde: string, fechaHasta: string) {
    var parametros = {
      params: new HttpParams()
        .set('canalId', canalId)
        .set('featureId', featureId)
        .set('colaborador', colaborador)
        .set('fechaDesde', fechaDesde)
        .set('fechaHasta', fechaHasta)
    };

    return this.http.get<ResponseModel>(`${this.apiWorkflow}/Workflow/GetInfoTrackingFeature`, parametros).pipe(catchError(this.errorHandler));
  }

  ObtenerComboTrackingFeature() {
    return this.http.get<ResponseModel>(`${this.apiWorkflow}/Workflow/GetComboTrackingFeature`).pipe(catchError(this.errorHandler));
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
