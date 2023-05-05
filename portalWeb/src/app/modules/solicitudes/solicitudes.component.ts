import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { SolicitudInterface } from 'src/app/models/solicitud/solicitud.interface';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { ResponseModel } from 'src/app/models/response.model'
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MarcacionService } from 'src/app/services/marcacion.service';
import { map, Observable, startWith } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { format } from 'date-fns';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { ComboMarcacion, EstadoSolicitud, SolcitudJustificacionResponse, SolcitudPermisoResponse, SolcitudVacacionResponse } from '../gestion-solicitud/gestion-solicitud.component';

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class SolicitudesComponent implements OnInit {
  columnasGrid = ['acciones', 'codigoFeature', 'identificacionEmpleado', 'nombreEmpleado', 'idEstadoSolicitud', 'fechaCreacion'];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataGrid!: MatTableDataSource<SolicitudInterface>;
  columnsToDisplayWithExpand = [...this.columnasGrid, 'expand'];
  expandedElement!: SolicitudInterface | null;
  pageSize: number;

  ctrlComboUdn = new FormControl(undefined as any, Validators.required);
  ctrlComboArea = new FormControl(undefined as any, Validators.required);
  ctrlComboScc = new FormControl(undefined as any, Validators.required);
  ctrlColaborador = new FormControl('');
  ctrlFechaDesde = new FormControl('', Validators.required);
  ctrlFechaHasta = new FormControl('', Validators.required);

  lsComboUdn: ComboMarcacion[] = [];
  lsComboArea: ComboMarcacion[] = [];
  lsComboScc: ComboMarcacion[] = [];

  filteredUdn!: Observable<ComboMarcacion[]>;
  filteredArea!: Observable<ComboMarcacion[]>;
  filteredScc!: Observable<ComboMarcacion[]>;

  solicitudPermiso!: SolcitudPermisoResponse;
  solicitudVacacion!: SolcitudVacacionResponse;
  solicitudJustificacion!: SolcitudJustificacionResponse;

  lstEstadoSolicitud: EstadoSolicitud[] = [];
  lstTipoSolicitud: TipoSolicitud[] = [];

  aplicadescuento = new FormControl('');

  constructor(private solicitudService: SolicitudService, private marcacionService: MarcacionService,
    private toaster: ToastrService, private spinner: NgxSpinnerService) {this.pageSize = 10;
      this.lstEstadoSolicitud = [
        { id: '46348A6B-7972-4999-AF8E-61F35E4F6B9B', Descripcion: 'RECHAZADA' },
        { id: '75001BDE-D753-4800-908A-83F5A397FC3A', Descripcion: 'ANULADA' },
        { id: '84666482-9DB4-4A60-A8EB-9F01DD735E16', Descripcion: 'APROBADA' },
        { id: '9C78A629-1203-4FF2-8CBD-D380A13CAFF1', Descripcion: 'PENDIENTE' },
        { id: 'AACB00C6-9347-4E48-9D84-E3A6E87F1BD6', Descripcion: 'SOLICITADA' }
      ];
      this.lstTipoSolicitud = [
        { nombre: 'PER', Descripcion: 'PERMISO' },
        { nombre: 'VAC', Descripcion: 'VACACIONES' },
        { nombre: 'JUS', Descripcion: 'JUSTIFICACIONES' },
      ]}

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
  ConsultarSolicitudGeneral(identificacion: string, fechaDesde: string, fechaHasta: string, udn: string, area: string, sscosto: string) {
    this.spinner.show();
    this.solicitudService.ConsultarSolicitudGeneral(identificacion, fechaDesde, fechaHasta, udn, area, sscosto)
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded) {
          let rsp: SolicitudInterface[] = resp.data;
          rsp= rsp.filter(x => x.codigoFeature === 'JUS' && x.idEstadoSolicitud === '84666482-9DB4-4A60-A8EB-9F01DD735E16'.toLowerCase());

          this.dataGrid = new MatTableDataSource<SolicitudInterface>(rsp);
          this.dataGrid.paginator = this.paginator;
          this.dataGrid.sort = this.sort;
          //console.log(resp.data);
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
          //console.log(res.data);
          this.solicitudPermiso = res.data;
        }
      });
  }

  ConsultarSolicitudVacacion(id: string) {
    this.solicitudService.ConsultarSolicitudVacacion(id)
      .subscribe(res => {
        if (res.succeeded) {
          //console.log(res.data);
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
  name = 'ExcelSheet.xlsx';
  exportToExcel(): void {
    let element = document.getElementById('tabla');
    const worksheet: XLSX.WorkSheet = XLSX.utils.table_to_sheet(element);

    const book: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, worksheet, 'Sheet1');

    XLSX.writeFile(book, this.name);
  }

    ActualizarJustificacion(justificacion: any) {
    this.spinner.show();
    this.solicitudService.ActualizarJustificacion2(justificacion)
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

  actualizarSolicitud(solicitud: any) {
    // console.log('aprobar', solicitud);
    let id = "1"; //Estado aprobar


        // if (solicitud.codigoFeature === 'PER') {
        //   let permiso = {
        //     StatusPermiso: id,
        //     NombreEmpleado: solicitud.nombreEmpleado,
        //     IdSolicitudPermiso: solicitud.id,
        //     comentarios: ''
        //   };

        //   this.ActualizarPermiso(permiso);
        // }

        // if (solicitud.codigoFeature === 'VAC') {
        //   let vacacion = {
        //     StatusPermiso: id,
        //     NombreEmpleado: solicitud.nombreEmpleado,
        //     IdSolicitudVacaciones: solicitud.id,
        //     comentarios: ''
        //   };

        //   this.ActualizarVacacion(vacacion);
        // }

        if (solicitud.codigoFeature === 'JUS') {
          let justificacion = {
            StatusJustificacion: id,
            NombreEmpleado: solicitud.nombreEmpleado,
            IdSolicitudJustificacion: solicitud.id,
            comentarios: '',
            aplicaDescuento: false,

          };

          this.ActualizarJustificacion(justificacion);
        }
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

  onSelectionUdn(option: ComboMarcacion) {
    //console.log(option.codigo);
    this.consultarComboBitacoraMarcacionArea(option.codigo);
  }

  onSelectionArea(option: any) {
    //console.log(option);
    this.spinner.show();
    this.consultarComboBitacoraMarcacionScc(this.ctrlComboUdn.value?.codigo!, option.codigo);
  }

  onSelectionScc(option: any) {
    //console.log(option);
  }

  getNombreSolicitud(cod: string): string {
    if (cod === 'PER')
      return 'Permiso'

    if (cod === 'VAC')
      return 'Vacación'

    if (cod === 'JUS')
      return 'Justificación'

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
  }

  buscarSolicitudes() {
    if (this.ctrlComboUdn.valid && this.ctrlComboArea.valid && this.ctrlComboScc.valid && this.ctrlFechaDesde.valid && this.ctrlFechaHasta.valid) {
      this.ConsultarSolicitudGeneral(
        this.ctrlColaborador.value || '',
        format(new Date(this.ctrlFechaDesde.value as string), 'yyyy-MM-dd'),
        format(new Date(this.ctrlFechaHasta.value as string), 'yyyy-MM-dd'),
        this.ctrlComboUdn.value?.codigo as string,
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

  retornaTipoSolicitud(nombre: string): string {
    nombre = nombre;
    // if (id === 'B09CCF2E-C409-4FAF-9AA6-3487BD860FE7')
    //   return 'ANULADA-AUTO';
    // if (id === '2901CD1D-4F22-4410-A2A1-F725BCD0DBCB')
    //   return 'FINALIZADA'

    let tipo = this.lstTipoSolicitud.find(x => x.nombre === 'JUS');

    return tipo !== undefined ? tipo.Descripcion : '';
  }

  esEstadoSolicitado(id: string) {
    return this.lstEstadoSolicitud.find(x => x.id === id.toUpperCase())?.Descripcion || '';
  }

  mostrarTextoCombo(opcion: ComboMarcacion): string {
    return opcion && opcion.descripcion ? opcion.descripcion : '';
  }

}
export interface TipoSolicitud {
  nombre: string,
  Descripcion: string
}

