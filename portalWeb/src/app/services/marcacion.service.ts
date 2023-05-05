import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RequestMarcacionWeb } from '../models/marcaciones/marcaciones';
import { ResponseModel } from '../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class MarcacionService {
  apiEvalCore: string = environment.apiEvalCore;
  uidCanal: string = environment.uidCanalWeb;

  constructor(private http: HttpClient) { }

  consultarComboBitacoraMarcacion(
    tipo: string,
    udn: string,
    area: string
  ): Observable<ResponseModel> {
    var parametros = {
      params: new HttpParams()
        .set('Tipo', tipo)
        .set('Udn', udn)
        .set('Area', area),
    };
    return this.http
      .get<ResponseModel>(
        `${this.apiEvalCore}/Marcacion/GetComboBitacoraMarcacion`,
        parametros
      )
      .pipe(catchError(this.errorHandler));
  }

  obtenerMarcaciones(
    udn: string,
    area: string,
    scosto: string,
    colaborador: String,
    evento: string,
    desde: String,
    hasta: String
  ): Observable<Response> {
    const requestUrl = `${this.apiEvalCore
      }/Marcacion/GetBitacoraMarcacion?CodUdn=${udn ?? ''}&CodArea=${area ?? ''
      }&CodSubcentro=${scosto ?? ''}&CodMarcacion=${evento ?? ''
      }&FechaDesde=${desde}&FechaHasta=${hasta}&Suscriptor=${colaborador ?? ''}`;
    return this.http
      .get<Response>(requestUrl)
      .pipe(catchError(this.errorHandler));
  }

  obtenerMarcacionesEspeciales(
    desde: String,
    hasta: String
  ): Observable<Response> {
    const requestUrl = `${this.apiEvalCore}/Marcacion/GetBitacoraMarcacionCapacidadesEspeciales?fechaDesde=${desde}&fechaHasta=${hasta}`;
    return this.http
      .get<Response>(requestUrl)
      .pipe(catchError(this.errorHandler));
  }

  obtenerAsistencia(udn: string, area: string, departamento: string, colaborador: string, novedades: string, periodo: string): Observable<ResponseModel> {
    const requestUrl = `${this.apiEvalCore
      }/Evaluacion/GetAsistencias?periodo=${periodo}&Udn=${udn}&Departamento=${departamento ?? ''}&Area=${area ?? ''}&identificacion=${colaborador ?? ''}&FiltroNovedades=${novedades}&idCanal=${this.uidCanal}`;
    // console.log(requestUrl)
    return this.http
      .get<ResponseModel>(requestUrl)
      .pipe(catchError(this.errorHandler));
  }

  obtenerCatalogoNovedades(filtroNovedad: string): Observable<ResponseModel> {
    //CA => Control de asistencia  //CN => Control de asistencias y novedades
    const requestUrl = `${this.apiEvalCore}/Evaluacion/GetComboNovedades?filtroNovedad=${filtroNovedad}`;
    //console.log(requestUrl)
    return this.http
      .get<ResponseModel>(requestUrl)
      .pipe(catchError(this.errorHandler));
  }

  obtenerPeriodos(udn: string): Observable<ResponseModel> {
    const requestUrl = `${this.apiEvalCore
      }/Evaluacion/GetComboPeriodos?codUdn=${udn}`;
    //console.log(requestUrl)
    return this.http
      .get<ResponseModel>(requestUrl)
      .pipe(catchError(this.errorHandler));
  }

  ConsultaMarcacionRecursos(uid: string, fechaDesde: string, fechasHasta: string) {
    var parametros = {
      params: new HttpParams()
        .set('IdCliente', uid)
        .set('fechaDesde', fechaDesde)
        .set('fechasHasta', fechasHasta)
    };

    return this.http.get<ResponseModel>(`${this.apiEvalCore}/Marcacion/ConsultaRecursos`, parametros).pipe(catchError(this.errorHandler));
  }

  ConsultaAsistenciasNovedades(fechaDesde: string, fechasHasta: string, lsNovedad: string, lsColaborador: string) {
    var parametros = {
      params: new HttpParams()
        .set('Identificacion', lsColaborador)
        .set('FiltroNovedades', lsNovedad)
        .set('fechaDesde', fechaDesde)
        .set('fechaHasta', fechasHasta)
    };

    return this.http.get<ResponseModel>(`${this.apiEvalCore}/Marcacion/GetNovedadesMarcacionesWeb`, parametros).pipe(catchError(this.errorHandler));
  }

  GenerarMarcacionWeb(req: RequestMarcacionWeb): Observable<ResponseModel> {
    var parametros = {
      identificacionJefe: '',
      identificacionColaborador: req.identificacionColaborador,
      pinColaborador: req.pinColaborador,
      tipoMarcacion: req.tipoMarcacion,
      base64Archivo: req.base64Archivo,
      nombreArchivo: req.nombreArchivo,
      extensionArchivo: req.extensionArchivo
    }

    return this.http.post<ResponseModel>(`${this.apiEvalCore}/Marcacion/GenerarMarcacionWeb`, parametros)
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
