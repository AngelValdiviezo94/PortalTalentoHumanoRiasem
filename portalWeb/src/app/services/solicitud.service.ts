import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseModel } from '../models/response.model';
import { SolicitudHorasExtrasRequest } from '../models/solicitud/solicitud-horasextras';
import { SolicitudJustificacionRequest } from '../models/solicitud/solicitud-justificacion.interacion';
import { SolicitudPermisoRequest } from '../models/solicitud/solicitud-permiso.interface';
import { SolicitudVacacionRequest } from '../models/solicitud/solicitud-vacacion.interface';

@Injectable({
  providedIn: 'root'
})
export class SolicitudService {
  apiWorkflow: string = environment.apiWorkflow;
  apiEvalCore: string = environment.apiEvalCore;
  estadoSolicitado: string = 'aacb00c6-9347-4e48-9d84-e3a6e87f1bd6';

  constructor(private http: HttpClient) { }

  ConsultarSolicitudGeneral(identificacion: string, fechaDesde: string, fechaHasta: string, udn: string, area: string, sscosto: string, tthh: boolean = false): Observable<ResponseModel> {
    var parametros = {
      params: new HttpParams()
        .set('Identificacion', identificacion)
        .set('FechaDesde', fechaDesde)
        .set('FechaHasta', fechaHasta)
        .set('Udn', udn)
        .set('Area', area)
        .set('ScCosto', sscosto)
        .set('SeleccionTodos', tthh)
    };

    return this.http.get<ResponseModel>(`${this.apiWorkflow}/Solicitudes/GetSolicitudesGeneral`, parametros).pipe(catchError(this.errorHandler));
  }

  ConsultarSolicitudJustificacion(idSolicitudJustificacion: string, idFeature: string): Observable<ResponseModel> {
    var parametros = {
      params: new HttpParams()
        .set('IdSolicitudJustificacion', idSolicitudJustificacion)
        .set('idFeature', idFeature)
    };

    return this.http.get<ResponseModel>(`${this.apiWorkflow}/Justificacion/GetJustificacion`, parametros).pipe(catchError(this.errorHandler));
  }

  ConsultarSolicitudPermiso(idSolicitudPermiso: string): Observable<ResponseModel> {
    var parametros = {
      params: new HttpParams()
        .set('IdSolicitudPermiso', idSolicitudPermiso)
    };

    return this.http.get<ResponseModel>(`${this.apiWorkflow}/Permisos/GetPermisos`, parametros).pipe(catchError(this.errorHandler));
  }

  ConsultarSolicitudHorasExtras(idSolicitudHorasExtras: string): Observable<ResponseModel> {
    var parametros = {
      params: new HttpParams()
        .set('IdSolicitudHora', idSolicitudHorasExtras)
    };

    return this.http.get<ResponseModel>(`${this.apiWorkflow}/HoraExtra/GetHoraExtra`, parametros).pipe(catchError(this.errorHandler));
  }

  ConsultarSolicitudVacacion(idSolicitudVacacion: string): Observable<ResponseModel> {
    var parametros = {
      params: new HttpParams()
        .set('IdSolicitudVacacion', idSolicitudVacacion)
    };

    return this.http.get<ResponseModel>(`${this.apiWorkflow}/Vacaciones/GetSolicitudVacacion`, parametros).pipe(catchError(this.errorHandler));
  }

  ActualizarPermiso(permiso: any) {
    // console.log(permiso);
    // kpi: se quita temporalmente el envio del parametro **idTurnoEnfermeria**
    // return this.http.put<ResponseModel>(`${this.apiWorkflow}/Permisos/UpdatePermiso?StatusPermiso=${permiso.StatusPermiso}&NombreEmpleado=${permiso.NombreEmpleado}&IdSolicitudPermiso=${permiso.IdSolicitudPermiso}&Comentarios=${permiso.comentarios}&idTurnoEnfermeria=${permiso.idTurnoEnfermeria}`, []).pipe(catchError(this.errorHandler));
    return this.http.put<ResponseModel>(`${this.apiWorkflow}/Permisos/UpdatePermiso?StatusPermiso=${permiso.StatusPermiso}&NombreEmpleado=${permiso.NombreEmpleado}&IdSolicitudPermiso=${permiso.IdSolicitudPermiso}&Comentarios=${permiso.comentarios}`, []).pipe(catchError(this.errorHandler));
  }

  ActualizarHorasExtras(horasextras: any) {
    var request = `${this.apiWorkflow}/HoraExtra/UpdateHoraExtra?Status=${horasextras.StatusPermiso}&NombreEmpleado=${horasextras.NombreEmpleado}&IdSolicitudHora=${horasextras.IdSolicitudHorasExtras}&Comentarios=${horasextras.comentarios}`;
    return this.http.put<ResponseModel>(request, []).pipe(catchError(this.errorHandler));
  }

  ActualizarVacacion(vacacion: any) {
    return this.http.put<ResponseModel>(`${this.apiWorkflow}/Vacaciones/UpdateVacacion?StatusPermiso=${vacacion.StatusPermiso}&NombreEmpleado=${vacacion.NombreEmpleado}&IdSolicitudVacaciones=${vacacion.IdSolicitudVacaciones}`, []).pipe(catchError(this.errorHandler));
  }

  ActualizarJustificacion2(justificacion: any) {
    return this.http.put<ResponseModel>(`${this.apiWorkflow}/Justificacion/UpdateJustificacion?StatusJustificacion=${justificacion.StatusJustificacion}&NombreEmpleado=${justificacion.NombreEmpleado}&IdSolicitudJustificacion=${justificacion.IdSolicitudJustificacion}&Comentarios=${justificacion.comentarios}&IdTurnoEnfermeria=${justificacion.idTurnoEnfermeria}&AplicaDescuento=${justificacion.aplicaDescuento}`, []).pipe(catchError(this.errorHandler));
  }

  ActualizarJustificacion(justificacion: any) {
    return this.http.put<ResponseModel>(`${this.apiWorkflow}/Justificacion/UpdateJustificacion?StatusJustificacion=${justificacion.StatusJustificacion}&NombreEmpleado=${justificacion.NombreEmpleado}&IdSolicitudJustificacion=${justificacion.IdSolicitudJustificacion}`, []).pipe(catchError(this.errorHandler));
  }

  ConsultarTipoPermiso() {
    return this.http.get<ResponseModel>(`${this.apiWorkflow}/Permisos/GetTipoPermiso`).pipe(catchError(this.errorHandler));
  }

  CrearSolicitudPermiso(permiso: SolicitudPermisoRequest) {
    return this.http.post<ResponseModel>(`${this.apiWorkflow}/Permisos/CrearPermiso`, permiso);
  }

  CrearSolicitudHorasExtras(extras: SolicitudHorasExtrasRequest) {
    return this.http.post<ResponseModel>(`${this.apiWorkflow}/HoraExtra/CreateHoraExtra`, extras);
  }

  ConsultarDiasJustificar(identificacion: string) {
    var parametros = {
      params: new HttpParams()
        .set('Identificacion', identificacion)
    };

    return this.http.get<ResponseModel>(`${this.apiWorkflow}/Justificacion/GetDiasJustificar`, parametros).pipe(catchError(this.errorHandler));
  }

  ConsultarDiasJustificarN(identificacion: string) {
    return this.http.get<ResponseModel>(`${this.apiWorkflow}/Justificacion/GetDiasJustificarNew?Identificacion=${identificacion}`).pipe(catchError(this.errorHandler));
  }

  ConsultarTipoJustificacion() {
    return this.http.get<ResponseModel>(`${this.apiWorkflow}/Justificacion/GetTipoJustificacion`).pipe(catchError(this.errorHandler));
  }

  CrearSolicitudJustificacion(justificacion: SolicitudJustificacionRequest) {
    return this.http.post<ResponseModel>(`${this.apiWorkflow}/Justificacion/CreateJustificacion`, justificacion);
  }

  ConsultarEmpleadoReemplazo(identificacion: string) {
    return this.http.get<ResponseModel>(`${this.apiWorkflow}/Vacaciones/GetEmpleadoReemplazo/${identificacion}`).pipe(catchError(this.errorHandler));
  }

  ConsultarPeriodoVacacion(identificacion: string) {
    return this.http.get<ResponseModel>(`${this.apiWorkflow}/Vacaciones/GetPeriodoVacacion/${identificacion}`).pipe(catchError(this.errorHandler));
  }

  ConsultarTurnosColaborador(identificacion: string, fechaDesde: string, fechaHasta: string): Observable<ResponseModel> {
    var parametros = {
      params: new HttpParams()
        .set('identificacion', identificacion)
        .set('fechaDesde', fechaDesde)
        .set('fechaHasta', fechaHasta)
    };
    return this.http.get<ResponseModel>(`${this.apiEvalCore}/Turnos/GetTurnosAsignados`, parametros)
  }

  CrearSolicitudVacacion(vacacion: SolicitudVacacionRequest) {
    return this.http.post<ResponseModel>(`${this.apiWorkflow}/Vacaciones/CreateVacacion`, vacacion);
  }

  ExisteSolicitudVacacionPendiente(identificacion: string): Observable<ResponseModel> {
    var parametros = {
      params: new HttpParams()
        .set('Identificacion', identificacion)
    };
    return this.http.get<ResponseModel>(`${this.apiWorkflow}/Vacaciones/ExistSolicitudVacacionPendiente`, parametros)
  }

  ComboMedico(){
    return this.http.get<ResponseModel>(`${this.apiEvalCore}/Turnos/GetTurnosByClaseSub?IdSubClase=6236D49B-B9EF-424D-8C2E-CB30EB84634F`).pipe(catchError(this.errorHandler));
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
