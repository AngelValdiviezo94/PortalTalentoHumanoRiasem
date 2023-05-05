import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConfiguracionMesaModel } from '../models/mesa-ayuda/configuracion-mesa.models';

@Injectable({
  providedIn: 'root'
})
export class MesaAyudaService {
  apiMesaAyuda: string = environment.apiMesaAyuda;

  constructor(private http: HttpClient) { }


  obtenerCatalogoMesa(): any {
    return this.http.get<any>(`${this.apiMesaAyuda}/Servicios/GetMesas`).pipe(catchError(this.errorHandler));
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
