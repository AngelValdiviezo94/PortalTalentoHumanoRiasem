import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ResponseModel } from '../models/response.model'
import { environment } from 'src/environments/environment';
import { AsignaTurnoRequest, TurnoCalendar } from '../models/turnos/turno-calendar.model';
import { CalendarEvent } from 'angular-calendar';
import { FechaService } from '../helper/fecha.service';
import { TipoJornadaType, TurnoType } from '../models/turnos/turno.model';
import { AsignacionTurnoResponse, AsignadoColaboradorInterface } from '../models/turnos/asignacion-turno';
import { format } from 'date-fns';

@Injectable({
  providedIn: 'root'
})

export class TurnosService {
  apiEvalCore: string = environment.apiEvalCore;
  apiWorkflow: string = environment.apiWorkflow;

  constructor(private http: HttpClient, private fs: FechaService) { }

  consultarTurnos(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${this.apiEvalCore}/Turnos/GetTurno`)//.pipe(catchError(this.errorHandler));
      .pipe(
        map((resp: ResponseModel) => {
          let lstTurnos: TurnoCalendar[] = [];
          let lstTipoJornadaType: TipoJornadaType[] = [];

          if (resp.succeeded) {
            lstTipoJornadaType = resp.data;
            let tmpTurnos: CalendarEvent[];

            lstTipoJornadaType.forEach((it) => {
              tmpTurnos = [];
              it.turnoType.forEach((ls: any) => {
                tmpTurnos.push({
                  id: ls.id,
                  title: `${this.fs.getTime(ls.entrada)} - ${this.fs.getTime(ls.salida)}  (${ls.totalHoras} horas / ${ls.codigoTurno?.replace('-00', '')})`,
                  start: this.fs.timeZoneEcuador(ls.entrada),
                  end: this.fs.timeZoneEcuador(ls.salida)
                });
              });

              lstTurnos.push({
                id: it.idTipoJornada,
                descripcion: it.tipoJornada,
                logo: it.logoTipoJornada,
                color: it.colorTipoJornada,
                turnos: tmpTurnos.sort((a, b) => (a.title < b.title) ? -1 : 1)
              });
            });
          }

          const response: ResponseModel = {
            succeeded: resp.succeeded,
            message: resp.message,
            statusCode: resp.statusCode,
            errors: resp.errors,
            data: {
              turnosCalendar: lstTurnos.sort((a, b) => (a.descripcion < b.descripcion) ? -1 : 1),
              tipoJornaType: lstTipoJornadaType
            }
          };

          return response;
        })
      )
  }

  consultarEmpleados(uidPadre: string): Observable<ResponseModel> {
    var parametros = {
      params: new HttpParams()
        .set('uid', uidPadre)
    };

    return this.http.get<ResponseModel>(`${this.apiWorkflow}/Workflow/GetClientesByIdPadre`, parametros).pipe(catchError(this.errorHandler));
  }

  consultarMaestroTurno(): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${this.apiEvalCore}/Turnos/GetMaestrosTurno`).pipe(catchError(this.errorHandler));
  }

  asignarTurnoColaborador(info: AsignaTurnoRequest): Observable<ResponseModel> {
    return this.http.post<ResponseModel>(`${this.apiEvalCore}/Turnos/AsignarTurnoColaborador`, info);
  }

  consultarTurnosAsignados(identificacion: string, fechaDesde: string, fechaHasta: string): Observable<ResponseModel> {
    var parametros = {
      params: new HttpParams()
        .set('identificacion', identificacion)
        .set('fechaDesde', fechaDesde)
        .set('fechaHasta', fechaHasta)
    };
    return this.http.get<ResponseModel>(`${this.apiEvalCore}/Turnos/GetTurnosAsignados`, parametros)
      .pipe(
        map((resp: ResponseModel) => {
          let turnosAsignados: AsignacionTurnoResponse[] = [];

          let turnos: AsignacionTurnoResponse[] = [];
          let subturnos: AsignacionTurnoResponse[] = [];

          let events: CalendarEvent[] = [];
          let colaboradorTurno: AsignadoColaboradorInterface[] = [];

          if (resp.succeeded) {
            turnosAsignados = resp.data;
            turnosAsignados.map(x => x.fechaAsignacion = new Date(x.fechaAsignacion));
            turnosAsignados = turnosAsignados.sort((a, b) => (a.fechaAsignacion < b.fechaAsignacion) ? -1 : 1)

            turnos = turnosAsignados.filter(x => x.idTurnoPadre === null);
            subturnos = turnosAsignados.filter(x => x.idTurnoPadre !== null);

            turnos.forEach(x => {
              if (!events.some(ev => format(ev.start, 'yyyy-MM-dd') === format(x.fechaAsignacion, 'yyyy-MM-dd') && ev.id === x.idTurno)) {
                events.push({
                  id: x.idTurno,
                  title: `${this.fs.getTime(x.horaEntrada)} - ${this.fs.getTime(x.horaSalida)} (${x.codigoTurno} )`,
                  start: new Date(`${format(x.fechaAsignacion, 'yyyy-MM-dd')} ${this.fs.getTime(x.horaEntrada)}`),
                  end: new Date(`${format(x.fechaAsignacion, 'yyyy-MM-dd')} ${this.fs.getTime(x.horaSalida)}`),//x.fechaAsignacion,
                });
              }

              colaboradorTurno.push({
                idColaborador: x.idColaborador,
                idTurno: x.idTurno,
                idAsignacion: x.id,
                colaborador: `${x.apellidosColaborador} ${x.nombresColaborador}`,
                fechaAsignacion: x.fechaAsignacion,
                subturnos: []
              });
            });

            subturnos.forEach(st => {
              let idx = colaboradorTurno.findIndex(ct => ct.idTurno === st.idTurnoPadre && ct.idColaborador === st.idColaborador && format(ct.fechaAsignacion as Date, 'yyyy-MM-dd') === format(st.fechaAsignacion, 'yyyy-MM-dd'));

              if (idx > -1) {
                colaboradorTurno[idx].subturnos.push({
                  id: st.idTurno,
                  idTurnoAsignado: st.id,
                  title: `${st.codigoTurno} - (${this.fs.getTime(st.horaEntrada)} - ${this.fs.getTime(st.horaSalida)})`,
                  selected: true
                });
              }
            });
          }

          const response: ResponseModel = {
            succeeded: resp.succeeded,
            message: resp.message,
            statusCode: resp.statusCode,
            errors: resp.errors,
            data: {
              turnosCalendar: events,
              colaboradorTurno: colaboradorTurno
            }
          };

          return response;
        })
      );
  }

  actualizarAsignacionTurnoSubturno(colaboradorAsignado: AsignadoColaboradorInterface[]) {
    return this.http.put<ResponseModel>(`${this.apiEvalCore}/Turnos/InactivateTurnoSubturno`, colaboradorAsignado);
  }

  consultarTurnosAsignadosExcel(udn: string, area: string, scc: string, fechaDesde: string, fechaHasta: string): Observable<ResponseModel> {
    var parametros = {
      params: new HttpParams()
        .set('codUdn', udn)
        .set('codArea', area)
        .set('codScc', scc)
        .set('fechaDesde', fechaDesde)
        .set('fechaHasta', fechaHasta)
    };

    return this.http.get<ResponseModel>(`${this.apiEvalCore}/Turnos/GetInfoTurnosAsignadosExcel`, parametros);
  }

  cargarInfoArchivoExcelTurnos(infoTurnos: string) {
    var info = {
      JsonTurnos: infoTurnos,
      Identificacion: ''
    }

    return this.http.post<ResponseModel>(`${this.apiEvalCore}/Turnos/CargarInfoArchivoExcelTurnos`, info);
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
