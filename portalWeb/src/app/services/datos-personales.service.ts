import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseModel } from '../models/response.model';

@Injectable({
  providedIn: 'root',
})
export class DatosPersonalesService {
  apiEnrolApp: string = environment.apiEnrolApp;
  apiEvalcore: string = environment.apiEvalCore;
  constructor(private http: HttpClient) {}

  obtenerCupoCredito(){
    return this.http.get<ResponseModel>(`${this.apiEnrolApp}/Billetera/GetCupoCredito`).pipe(catchError(this.errorHandler));
  }

  obtenerFamiliares(id:string){
    return this.http.get<ResponseModel>(`${this.apiEnrolApp}/Familiares/GetListadoFamiliarColaborador?colaboradorId=${id}`).pipe(catchError(this.errorHandler));
  }

  obtenerParentezco():Observable<ResponseModel>{
    return this.http.get<ResponseModel>(`${this.apiEnrolApp}/Familiares/GetTipoRelacionFamiliar`).pipe(catchError(this.errorHandler));
  }

  autorizarFamiliar(colaboradorId: string, nombres: string, apellidos: string, alias:string,tipoIdentificacion:string,identificacion:string,celular:string,correo:string,habilitado:boolean,cupo:string,fechaDesde:string,fechaHasta:string,tipoRelacionFamiliarId:string): Observable<ResponseModel> {
    let objeto = {
      colaboradorId,
      nombres,
      apellidos,
      alias,
      tipoIdentificacion,
      identificacion,
      celular,
      correo,
      habilitado,
      cupo,
      fechaDesde,
      fechaHasta,
      tipoRelacionFamiliarId
    };
    return this.http.post<ResponseModel>(`${this.apiEnrolApp}/Familiares/CreateFamiliarColaborador`, objeto).pipe(catchError(this.errorHandler));
  }

  editarFamiliar(id:string,colaboradorId:string,habilitado:boolean,nombres?:string, apellidos?: string, alias?:string,identificacion?:string,celular?:string,correo?:string,cupo?:string,fechaDesde?:string,fechaHasta?:string,tipoRelacionFamiliarId?:string,eliminado?:boolean): Observable<ResponseModel>{
    let objeto = {
      id,
      colaboradorId,
      habilitado,
      nombres,
      apellidos,
      alias,
      // tipoIdentificacion,
      identificacion,
      celular,
      correo,
      cupo,
      fechaDesde,
      fechaHasta,
      tipoRelacionFamiliarId
    };
    // console.log(objeto)
    return this.http.put<ResponseModel>(`${this.apiEnrolApp}/Familiares/UpdateFamiliarColaborador`,objeto).pipe(catchError(this.errorHandler));
  }

  eliminarFamiliar(id:string,colaboradorId:string,habilitado:boolean,eliminado?:boolean): Observable<ResponseModel>{
    let objeto = {
      id,
      colaboradorId,
      habilitado,
      eliminado
    };
    return this.http.put<ResponseModel>(`${this.apiEnrolApp}/Familiares/UpdateFamiliarColaborador`,objeto).pipe(catchError(this.errorHandler));
  }

  verificarImagen(base64:string,nombre:string,extension:string): Observable<ResponseModel> {
    let objeto = {
      base64,
      nombre,
      extension
    };
    return this.http.post<ResponseModel>(`${this.apiEvalcore}/Biometria/VerificacionFacial`, objeto).pipe(catchError(this.errorHandler));
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
