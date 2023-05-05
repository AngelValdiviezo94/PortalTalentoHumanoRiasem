import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseModel } from '../models/response.model';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  apiEnrolApp: string = environment.apiEnrolApp;

  constructor(private http: HttpClient) { }

  optenerEmpleado(
    identificacion: string,
  ): Observable<ResponseModel> {
    const requestUrl = `${
      this.apiEnrolApp
    }/Empleados/${identificacion}`;
    return this.http
      .get<ResponseModel>(requestUrl)
      .pipe(catchError(this.errorHandler));
  }

  onbtenerRolDePago(identificacion: string,fechaCorte:string): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${this.apiEnrolApp}/Reportes/GetRolPago/${identificacion}/${fechaCorte}`).pipe(catchError(this.errorHandler));
  }

  onbtenerCertificado(identificacion: string): Observable<ResponseModel> {
    return this.http.get<ResponseModel>(`${this.apiEnrolApp}/Reportes/GetCertifLaboralByIdentificacion/${identificacion}`).pipe(catchError(this.errorHandler));
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
