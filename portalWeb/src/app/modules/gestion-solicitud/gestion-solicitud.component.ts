import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { SolicitudInterface } from 'src/app/models/solicitud/solicitud.interface';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { ResponseModel } from 'src/app/models/response.model'
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MarcacionService } from 'src/app/services/marcacion.service';
import { map, Observable, of, startWith } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { format, startOfMonth } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { FeatureService } from 'src/app/helper/feature.service';
import { environment } from 'src/environments/environment';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModalArchivoAdjuntoJustificacionComponent } from './modal-archivo-adjunto-justificacion/modal-archivo-adjunto-justificacion.component';
import { TurnoType } from 'src/app/models/turnos/turno.model';

const feaGestionSolictud = environment.codFeaGestionSolicitudes;
const atriCodConsultar = 'CON';
const atriCodTTHH = 'THH';

@Component({
  selector: 'app-gestion-solicitud',
  templateUrl: './gestion-solicitud.component.html',
  styleUrls: ['./gestion-solicitud.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class GestionSolicitudComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataGrid!: MatTableDataSource<SolicitudInterface>;
  columnasGrid = ['acciones', 'codigoFeature', 'identificacionEmpleado', 'nombreEmpleado', 'idEstadoSolicitud', 'fechaCreacion'];
  columnsToDisplayWithExpand = [...this.columnasGrid, 'expand'];
  expandedElement!: SolicitudInterface | null;
  pageSize: number;

  fechaDesdeIni: Date = startOfMonth(new Date());

  ctrlComboUdn = new FormControl(undefined as any);
  ctrlComboArea = new FormControl(undefined as any);
  ctrlComboScc = new FormControl(undefined as any);
  ctrlColaborador = new FormControl('');
  ctrlFechaDesde = new FormControl(this.fechaDesdeIni, Validators.required);
  ctrlFechaHasta = new FormControl(new Date(), Validators.required);

  lsComboUdn: ComboMarcacion[] = [];
  lsComboArea: ComboMarcacion[] = [];
  lsComboScc: ComboMarcacion[] = [];

  filteredUdn!: Observable<ComboMarcacion[]>;
  filteredArea!: Observable<ComboMarcacion[]>;
  filteredScc!: Observable<ComboMarcacion[]>;

  solicitudPermiso!: SolcitudPermisoResponse;
  solicitudHorasExtras!: SolcitudHorasExtrasResponse;
  solicitudVacacion!: SolcitudVacacionResponse;
  solicitudJustificacion!: SolcitudJustificacionResponse;

  lstEstadoSolicitud: EstadoSolicitud[] = [];

  isAtrConsultarActive: boolean = false;
  isAtrTTHHActive: boolean = false;

  showModalVisualizarAdjunto: boolean = false;

  constructor(private solicitudService: SolicitudService, private marcacionService: MarcacionService,
    private toaster: ToastrService, private spinner: NgxSpinnerService, private featureService: FeatureService,
    public dialog: MatDialog) {
    this.pageSize = 10;

    this.isAtrConsultarActive = this.featureService.isAtributoActive(feaGestionSolictud, atriCodConsultar);
    this.isAtrTTHHActive = this.featureService.isAtributoActive(feaGestionSolictud, atriCodTTHH);
    // console.log(this.isAtrTTHHActive);
    this.lstEstadoSolicitud = [
      { id: '46348A6B-7972-4999-AF8E-61F35E4F6B9B', Descripcion: 'RECHAZADA' },
      { id: '75001BDE-D753-4800-908A-83F5A397FC3A', Descripcion: 'ANULADA' },
      { id: '84666482-9DB4-4A60-A8EB-9F01DD735E16', Descripcion: 'APROBADA' },
      { id: '9C78A629-1203-4FF2-8CBD-D380A13CAFF1', Descripcion: 'PENDIENTE' },
      { id: 'AACB00C6-9347-4E48-9D84-E3A6E87F1BD6', Descripcion: 'SOLICITADA' }
    ]
  }

  ngOnInit(): void {
    this.consultarComboBitacoraMarcacionUdn();
  }

  ngAfterViewInit() {
    this.paginator._intl.itemsPerPageLabel = 'Registros por página';
    this.paginator._intl.nextPageLabel = 'Siguiente página';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.lastPageLabel = 'Última página';
    this.paginator._intl.firstPageLabel = 'Primera página';
  }

  openMedico(solicitud:any){
    const dialogref= this.dialog.open(DialogMedico, {
      disableClose: true,
      autoFocus: false,
      closeOnNavigation: true,
      data:solicitud
    });
    dialogref.afterClosed().subscribe((result) => {
      if (result == true) {
      } else {
      }
      this.consultarComboBitacoraMarcacionUdn();
    });
  }



  ConsultarSolicitudGeneral(identificacion: string, fechaDesde: string, fechaHasta: string, udn: string, area: string, sscosto: string) {
    this.spinner.show();

    this.solicitudService.ConsultarSolicitudGeneral(identificacion, fechaDesde, fechaHasta, udn, area, sscosto, this.isAtrTTHHActive)
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded) {
          // console.log(resp.data);
          this.dataGrid = new MatTableDataSource<SolicitudInterface>(resp.data);
          this.dataGrid.paginator = this.paginator;
          this.dataGrid.sort = this.sort;
        } else {
          this.dataGrid = new MatTableDataSource<SolicitudInterface>([]);
          this.dataGrid.paginator = this.paginator;
          this.dataGrid.sort = this.sort;
        }
        this.spinner.hide();
      }, () => { this.spinner.hide(); });
  }

  consultarComboBitacoraMarcacionUdn() {
    this.marcacionService.consultarComboBitacoraMarcacion('UD', '', '')
      .subscribe(resp => {
        if (resp.succeeded) {
          this.lsComboUdn = resp.data;
          this.filteredUdn = this.ctrlComboUdn.valueChanges.pipe(
            startWith(''),
            map(value => {
              const name = typeof value === 'string' ? value : value?.descripcion;
              return name ? this._filterUdn(name as string) : this.lsComboUdn.slice();
            }),
          );
        }
      });
  }

  consultarComboBitacoraMarcacionArea(udn: string) {
    this.marcacionService.consultarComboBitacoraMarcacion('AR', udn, '')
      .subscribe(resp => {
        if (resp.succeeded) {
          this.lsComboArea = resp.data;
          this.filteredArea = this.ctrlComboArea.valueChanges.pipe(
            startWith(''),
            map(value => {
              const name = typeof value === 'string' ? value : value?.descripcion;
              return name ? this._filterArea(name as string) : this.lsComboArea.slice();
            }),
          );
        }
      });
  }

  consultarComboBitacoraMarcacionScc(udn: string, area: string) {
    this.marcacionService.consultarComboBitacoraMarcacion('SC', udn, area)
      .subscribe(resp => {
        if (resp.succeeded) {
          this.lsComboScc = resp.data;
          // console.log(area);
          // this.filteredScc = of(this.lsComboScc);
          this.filteredScc = this.ctrlComboScc.valueChanges.pipe(
            startWith(''),
            map(value => {
              const name = typeof value === 'string' ? value : value?.descripcion;
              return name ? this._filterScc(name as string) : this.lsComboScc.slice();
            }),
          );
        }
        this.spinner.hide();
      });
  }

  ConsultarSolicitudPermiso(id: string) {
    this.solicitudService.ConsultarSolicitudPermiso(id)
      .subscribe(res => {
        if (res.succeeded) {
          // console.log(res.data);
          this.solicitudPermiso = res.data;
        }
      });
  }

  ConsultarSolicitudHorasExtras(id: string) {
    this.solicitudService.ConsultarSolicitudHorasExtras(id)
      .subscribe(res => {
        if (res.succeeded) {
          // console.log(res.data);
          this.solicitudHorasExtras = res.data;
        }
      });
  }

  ConsultarSolicitudVacacion(id: string) {
    this.solicitudService.ConsultarSolicitudVacacion(id)
      .subscribe(res => {
        if (res.succeeded) {
          // console.log(res.data);
          this.solicitudVacacion = res.data;
        }
      });
  }

  ConsultarSolicitudJustificacion(id: string, feature: string) {
    this.solicitudService.ConsultarSolicitudJustificacion(id, feature)
      .subscribe(res => {
        if (res.succeeded) {
          //console.log(res.data);
          this.solicitudJustificacion = res.data;
        }
      });
  }

  ActualizarPermiso(permiso: any) {
    this.spinner.show();
    this.solicitudService.ActualizarPermiso(permiso)
      .subscribe(res => {
        if (res.succeeded) {
          this.toaster.success(res.message);
          this.buscarSolicitudes();
        } else {
          this.toaster.error(res.message);
        }
        this.spinner.hide();
      }, () => { this.spinner.hide(); });
  }

  ActualizarHorasExtras(horasextras: any) {
    this.spinner.show();
    this.solicitudService.ActualizarHorasExtras(horasextras)
      .subscribe(res => {
        if (res.succeeded) {
          this.toaster.success(res.message);
          this.buscarSolicitudes();
        } else {
          this.toaster.error(res.message);
        }
        this.spinner.hide();
      }, () => { this.spinner.hide(); });
  }

  ActualizarVacacion(vacacion: any) {
    this.spinner.show();
    this.solicitudService.ActualizarVacacion(vacacion)
      .subscribe(res => {
        if (res.succeeded) {
          this.toaster.success(res.message);
          this.buscarSolicitudes();
        } else {
          this.toaster.error(res.message);
        }
        this.spinner.hide();
      }, () => { this.spinner.hide(); });
  }

  ActualizarJustificacion(vacacion: any) {
    this.spinner.show();
    this.solicitudService.ActualizarJustificacion(vacacion)
      .subscribe(res => {
        if (res.succeeded) {
          this.toaster.success(res.message);
          this.buscarSolicitudes();
        } else {
          this.toaster.error(res.message);
        }
        this.spinner.hide();
      }, () => { this.spinner.hide(); });
  }

  aprobarSolicitud(solicitud: any) {
    // console.log('aprobar', solicitud);

    if(solicitud.idTipoPermiso == '05ad0d42-2c8b-49d2-aeb9-4abf953d53a9' || solicitud.idTipoPermiso == '271289c3-88c5-4551-9093-e5a5d4bbc23e' || solicitud.idTipoPermiso == '75ed0645-07c2-46d9-86f5-a660de94b67d'){
      this.openMedico(solicitud);
    }else{
      let id = "1"; //Estado aprobar
    let comentario: string = '';

    Swal.fire({
      title: '¿ Confirmar acción ?',
      input: 'text',
      inputAttributes: {
        input: 'text',
        placeholder: 'Ingresar comentario (opcional)'
      },
      preConfirm: function (mensaje) {
        comentario = mensaje;
      },
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      width: 400
    }).then((result: any) => {
      if (result.isConfirmed) {
        if (solicitud.codigoFeature === 'PER') {
          let permiso = {
            StatusPermiso: id,
            NombreEmpleado: solicitud.nombreEmpleado,
            IdSolicitudPermiso: solicitud.id,
            comentarios: comentario
          };

          this.ActualizarPermiso(permiso);
        }

        if (solicitud.codigoFeature === 'HEX') {
          let horasextras = {
            StatusPermiso: id,
            NombreEmpleado: solicitud.nombreEmpleado,
            IdSolicitudHorasExtras: solicitud.id,
            comentarios: comentario
          };

          this.ActualizarHorasExtras(horasextras);
        }

        if (solicitud.codigoFeature === 'VAC') {
          let vacacion = {
            StatusPermiso: id,
            NombreEmpleado: solicitud.nombreEmpleado,
            IdSolicitudVacaciones: solicitud.id,
            comentarios: comentario
          };

          this.ActualizarVacacion(vacacion);
        }

        if (solicitud.codigoFeature === 'JUS') {
          let justificacion = {
            StatusJustificacion: id,
            NombreEmpleado: solicitud.nombreEmpleado,
            IdSolicitudJustificacion: solicitud.id,
            comentarios: comentario
          };

          this.ActualizarJustificacion(justificacion);
        }
      }
    });
    }
  }

  rechazarSolicitud(solicitud: any) {
    // console.log('rechazar', solicitud);
    let id = "2"; //Estado rechazar
    let comentario: string = '';

    Swal.fire({
      title: '¿Confirmar acción?',
      input: 'text',
      inputAttributes: {
        input: 'text',
        required: 'true',
        placeholder: 'Debes ingresar un comentario'
      },
      preConfirm: function (mensaje) {
        comentario = mensaje;
      },
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      // allowOutsideClick: false,
      width: 400
    }).then((result: any) => {
      if (result.isConfirmed) {
        // console.log(comentario);
        if (solicitud.codigoFeature === 'PER') {
          let permiso = {
            StatusPermiso: id,
            NombreEmpleado: solicitud.nombreEmpleado,
            IdSolicitudPermiso: solicitud.id,
            comentarios: comentario
          };

          this.ActualizarPermiso(permiso);
        }

        if (solicitud.codigoFeature === 'HEX') {
          let horasextras = {
            StatusPermiso: id,
            NombreEmpleado: solicitud.nombreEmpleado,
            IdSolicitudHorasExtras: solicitud.id,
            comentarios: comentario
          };

          this.ActualizarHorasExtras(horasextras);
        }

        if (solicitud.codigoFeature === 'VAC') {
          let vacacion = {
            StatusPermiso: id,
            NombreEmpleado: solicitud.nombreEmpleado,
            IdSolicitudVacaciones: solicitud.id,
            comentarios: comentario
          };

          this.ActualizarVacacion(vacacion);
        }

        if (solicitud.codigoFeature === 'JUS') {
          let justificacion = {
            StatusJustificacion: id,
            NombreEmpleado: solicitud.nombreEmpleado,
            IdSolicitudJustificacion: solicitud.id,
            comentarios: comentario
          };

          this.ActualizarJustificacion(justificacion);
        }
      }
    });
  }

  private _filterUdn(value: string): ComboMarcacion[] {
    const filterValue = value.toLowerCase();

    return this.lsComboUdn.filter(option => option.descripcion.toLowerCase().includes(filterValue));
  }

  private _filterArea(value: string): ComboMarcacion[] {
    const filterValue = value.toLowerCase();

    return this.lsComboArea.filter(option => option.descripcion.toLowerCase().includes(filterValue));
  }

  private _filterScc(value: string): ComboMarcacion[] {
    const filterValue = value.toLowerCase();

    return this.lsComboScc.filter(option => option.descripcion.toLowerCase().includes(filterValue));
  }

  onSelectionUdn(option: ComboMarcacion, event: any) {
    // console.log(option.codigo);
    if (event.isUserInput) {
      this.consultarComboBitacoraMarcacionArea(option.codigo);
      this.ctrlComboArea.setValue('');
      this.ctrlComboScc.setValue('');
    }
  }

  onSelectionArea(option: ComboMarcacion, event: any) {
    this.spinner.show();
    if (event.isUserInput) {
      this.ctrlComboScc.setValue('');
      this.consultarComboBitacoraMarcacionScc(this.ctrlComboUdn.value?.codigo, option.codigo);
    }
  }

  onSelectionScc(option: any) {
    // console.log(option);
  }

  getNombreSolicitud(cod: string): string {
    if (cod === 'PER')
      return 'Permiso'

    if (cod === 'VAC')
      return 'Vacación'

    if (cod === 'JUS')
      return 'Justificación'

    if (cod === 'HEX')
      return 'Horas Extras'

    return '';
  }

  detalleSolcitud(solicitud: any) {
    //console.log(solicitud);
    if (solicitud.codigoFeature === 'PER')
      this.ConsultarSolicitudPermiso(solicitud.id);

    if (solicitud.codigoFeature === 'VAC')
      this.ConsultarSolicitudVacacion(solicitud.id);

    if (solicitud.codigoFeature === 'JUS')
      this.ConsultarSolicitudJustificacion(solicitud.id, solicitud.idFeature);

    if (solicitud.codigoFeature === 'HEX')
      this.ConsultarSolicitudHorasExtras(solicitud.id);
  }

  buscarSolicitudes() {
    // console.log(this.ctrlFechaDesde.value, this.ctrlFechaHasta.value)
    if (this.ctrlComboUdn.valid && this.ctrlComboArea.valid && this.ctrlComboScc.valid && this.ctrlFechaDesde.valid && this.ctrlFechaHasta.valid) {
      // console.log(this.ctrlComboUdn.value, this.ctrlComboArea.value, this.ctrlComboScc.value);
      if (this.ctrlFechaHasta.value! < this.ctrlFechaDesde.value!) {
        this.toaster.warning('"Fecha desde" no puede ser mayor que la "fecha hasta"');
        return;
      }

      this.ConsultarSolicitudGeneral(
        this.ctrlColaborador.value || '',
        `${format(new Date(this.ctrlFechaDesde.value!), 'yyyy-MM-dd')} 00:00:00`,
        `${format(new Date(this.ctrlFechaHasta.value!), 'yyyy-MM-dd')} 23:59:59`,
        this.ctrlComboUdn.value?.codigo || '',
        this.ctrlComboArea.value?.codigo || '',
        this.ctrlComboScc.value?.codigo || '');
    } else {
      this.ctrlComboUdn.markAllAsTouched();
      this.ctrlComboArea.markAllAsTouched();
      this.ctrlComboScc.markAllAsTouched();
      this.ctrlFechaDesde.markAllAsTouched();
      this.ctrlFechaHasta.markAllAsTouched();
    }
  }

  retornaEstadoSolicitud(id: string): string {
    id = id.toUpperCase();
    // if (id === 'B09CCF2E-C409-4FAF-9AA6-3487BD860FE7')
    //   return 'ANULADA-AUTO';
    // if (id === '2901CD1D-4F22-4410-A2A1-F725BCD0DBCB')
    //   return 'FINALIZADA'

    let estado = this.lstEstadoSolicitud.find(x => x.id === id);

    return estado !== undefined ? estado.Descripcion : '';
  }

  esEstadoSolicitado(id: string) {
    return this.lstEstadoSolicitud.find(x => x.id === id.toUpperCase())?.Descripcion || '';
  }

  isControlEmpty(nombre: string): Boolean {
    if (nombre === 'UDN')
      return !this.ctrlComboUdn.value ? true : false;

    if (nombre === 'ARE')
      return !this.ctrlComboArea.value ? true : false;

    if (nombre === 'SCC')
      return !this.ctrlComboScc.value ? true : false;

    if (nombre === 'COL')
      return this.ctrlColaborador.value === '' ? true : false;

    return true;
  }

  limpiarControl(nombre: String): void {
    if (nombre === 'UDN') {
      this.ctrlComboUdn.setValue(undefined);
      this.ctrlComboArea.setValue(undefined);
      this.ctrlComboScc.setValue(undefined);
      this.filteredArea = new Observable<ComboMarcacion[]>();
      this.filteredScc = new Observable<ComboMarcacion[]>();
    }

    if (nombre === 'ARE') {
      this.ctrlComboArea.setValue(undefined);
      this.ctrlComboScc.setValue(undefined);
      this.filteredScc = new Observable<ComboMarcacion[]>();
    }

    if (nombre === 'SCC')
      this.ctrlComboScc.setValue(undefined);

    if (nombre === 'COL')
      this.ctrlColaborador.setValue('');
  }

  VisualizarAdjunto(ruta: string) {
    // console.log(ruta);
    this.dialog.open(ModalArchivoAdjuntoJustificacionComponent,
      { disableClose: false, closeOnNavigation: true, width: '90%', data: ruta });
  }

  GetUrlExtension(url: string) {
    return url?.split(/[#?]/)[0]?.split('.')?.pop()?.trim();
  }

  mostrarTextoCombo(opcion: ComboMarcacion): string {
    return opcion && opcion.descripcion ? opcion.descripcion : '';
  }

}

export interface EstadoSolicitud {
  id: string,
  Descripcion: string
}

export interface SolcitudPermisoResponse {
  id: string;
  codOrganizacion: number;
  idTipoPermiso: string;
  tipoPermiso: string;
  idEstadoSolicitud: string;
  numeroSolicitud: number;
  idSolicitante: number;
  idBeneficiario: number;
  nombreEmpleado: null;
  identificacionEmpleado: string;
  porHoras: boolean;
  fechaDesde: Date;
  horaInicio: string;
  fechaHasta: Date;
  horaFin: string;
  cantidadHoras: Date;
  cantidadDias: number;
  observacion: string;
  fechaCreacion: Date;
}

export interface SolcitudHorasExtrasResponse {
  id:                  string;
  fechaDesde:          Date;
  fechaHasta:          Date;
  horaInicio:          string;
  horaFin:             string;
  identBeneficiario:   string;
  identSolicitante:    string;
  comentarios:         string;
  idEstadoSolicitud:   string;
  idTurnoColaborador:  string;
  fechaCreacion:       Date;
  usuarioCreacion:     string;
  fechaModificacion:   Date;
  usuarioModificacion: string;
}

export interface SolcitudVacacionResponse {
  id: string;
  codOrganizacion: number;
  periodoAfectacion: null;
  idTipoSolicitud: string;
  idEstadoSolicitud: string;
  numeroSolicitud: number;
  nombreEmpleado: null;
  identificacionEmpleado: string;
  idSolicitante: number;
  idBeneficiario: number;
  fechaDesde: Date;
  fechaHasta: Date;
  cantidadDias: number;
  codigoEmpleadoReemplazo: string;
  observacion: string;
  fechaCreacion: Date;
}

export interface SolcitudJustificacionResponse {
  id: string;
  codOrganizacion: number;
  idTipoJustificacion: string;
  idFeature: string;
  tipoJustificacion: string;
  idEstadoSolicitud: string;
  nombreEmpleado: string;
  identBeneficiario: string;
  identificacionEmpleado: string;
  idMarcacion: number;
  idTurno: number;
  turnoEntrada: Date;
  marcacionSalida: Date;
  turnoSalida: Date;
  docAdjunto: any[];
  comentarios: string;
  fechaCreacion: Date;
  usuarioCreacion: string;
  fechaModificacion: Date;
  usuarioModificacion: string;
  fechaMarcacionG:Date;
}

export interface ComboMarcacion {
  codigo: string,
  descripcion: string
}

@Component({
  selector: 'modal-medico',
  templateUrl: 'modalMedico.html',
  styleUrls: ['./gestion-solicitud.component.scss'],
})

export class DialogMedico implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private solicitudesService: SolicitudService,private toast: ToastrService,public dialogRef: MatDialogRef<DialogMedico>, private solicituService: SolicitudService, private spinner: NgxSpinnerService) {}
  ctrlTurno = new FormControl('', [Validators.required]);
  ctrlComentario = new FormControl('', [Validators.required]);
  lsTurnos: TurnoType[] = [];
  filteredTurno!: Observable<TurnoType[]>;
  idTurno!: string;
  ngOnInit(): void {
    this.obtenerCatalogoMedico();
    // console.log(this.data);
  }

  obtenerCatalogoMedico(){
    this.solicitudesService.ComboMedico().subscribe((resp:ResponseModel)=>{
      if(resp.succeeded){
        this.lsTurnos = resp.data;
        this.filteredTurno = this.ctrlTurno.valueChanges.pipe(
          startWith(''),
          map((value) => this._filterTurno(value || ''))
        );
      }
    })
  }
  private _filterTurno(value: string): TurnoType[] {
    const filterValue = value.toLowerCase();
    return this.lsTurnos.filter((option) =>
      option.descripcion.toLowerCase().includes(filterValue)
    );
  }
  onSelectionTur(option: TurnoType, event: any) {
    if (event.isUserInput) {
      // console.log(option)
      this.idTurno = option.id;
    }
  }
  actualizarPermiso() {
    if(this.ctrlComentario.valid && this.ctrlTurno.valid){
      this.spinner.show();

    if(this.data.codigoFeature == 'PER'){
      var permiso = {
        StatusPermiso: '1',
        NombreEmpleado: this.data.nombreEmpleado,
        IdSolicitudPermiso: this.data.id,
        comentarios: this.ctrlComentario.value,
        idTurnoEnfermeria: this.idTurno
      }
      this.solicituService.ActualizarPermiso(permiso)
      .subscribe((res:ResponseModel) => {
        if (res.succeeded) {
          this.toast.success(res.message);
          this.dialogRef.close(true);
        } else {
          this.toast.error(res.message);
        }
        this.spinner.hide();
      }, () => { this.spinner.hide(); });
    }else if (this.data.codigoFeature == 'JUS'){
      var justificacion = {
        StatusJustificacion: '1',
        NombreEmpleado: this.data.nombreEmpleado,
        IdSolicitudJustificacion: this.data.id,
        comentarios: this.ctrlComentario.value,
        idTurnoEnfermeria: this.idTurno,
        aplicaDescuento: true
      }
      this.solicituService.ActualizarJustificacion2(justificacion)
      .subscribe((res:ResponseModel) => {
        if (res.succeeded) {
          this.toast.success(res.message);
          this.dialogRef.close(true);
        } else {
          this.toast.error(res.message);
        }
        this.spinner.hide();
      }, () => { this.spinner.hide(); });
    }
    }else{
      this.ctrlComentario.markAllAsTouched();
      this.ctrlTurno.markAllAsTouched();
    }
  }
}
