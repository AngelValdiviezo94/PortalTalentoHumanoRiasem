import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { catchError, delay, map, startWith } from 'rxjs/operators';
import { format, startOfMonth } from 'date-fns';
import { Observable } from 'rxjs';
import { MarcacionService } from 'src/app/services/marcacion.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { FeatureService } from 'src/app/helper/feature.service';
import {
  Asistencia,
  Novedades,
  SolicitudesA,
} from 'src/app/models/marcaciones/asistencia';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { SolicitudService } from 'src/app/services/solicitud.service';
import {
  SolcitudPermisoResponse,
  SolcitudVacacionResponse,
  SolcitudJustificacionResponse,
} from '../gestion-solicitud/gestion-solicitud.component';
import { ResponseModel } from 'src/app/models/response.model';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SolicitudPermiso } from 'src/app/models/solicitud/solicitud-permiso.interface';
import { SolicitudVacacion } from 'src/app/models/solicitud/solicitud-vacacion.interface';
import { SolicitudJustificacion } from 'src/app/models/solicitud/solicitud-justificacion.interacion';
import { MatPaginator } from '@angular/material/paginator';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.ms-excel;charset=UTF-8';
const EXCEL_EXTENSION = '.xls';
import { ComboMarcacion, ComboPeriodo } from 'src/app/models/marcaciones/marcaciones';
import { ControlAsistencia } from 'src/app/models/reportes/control_asistencia';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatSort } from '@angular/material/sort';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
const feaCodTurno = environment.codFeaTurno;
@Component({
  selector: 'app-control-asistencia',
  templateUrl: './control-asistencia.component.html',
  styleUrls: ['./control-asistencia.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('colaborador', style({ height: '*' })),
      transition(
        'colaborador <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class ControlAsistenciaComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  isFeatureActive: boolean;
  displayedColumns: string[] = [
    'udn',
    'colaborador',
    'fecha',
    'dia',
    'entradaL',
    'marcacionEntrada',
    'salidaL',
    'marcacionSalida',
    'entradaR',
    'marcacionEntradaR',
    'salidaR',
    'marcacionSalidaR',
    'novedad',
    'solicitudes'
  ];
  //datasource: MatTableDataSource<data> = {udn: 'Jorge',nombre: 'Jorge',fecha: 'Jorge',dia: 'Jorge',turnolaboral: 'Jorge',receso:'Jorge',novedad:'Jorge',solicitud:'Jorge',descuento:'Jorge',};
  ctrlComboNov = new FormControl(undefined as any, Validators.required);
  ctrlComboUdn = new FormControl(undefined as any, Validators.required);
  ctrlComboArea = new FormControl();
  ctrlComboPeriodo = new FormControl(undefined as any, Validators.required);
  ctrlComboScc = new FormControl();
  fechaDesdeIni: Date = startOfMonth(new Date());
  eventocontrol = new FormControl();
  colaboradorcontrol = new FormControl();
  desdecontrol = new FormControl(
    this.fechaDesdeIni.toISOString(),
    Validators.required
  );
  hastacontrol = new FormControl(new Date().toISOString(), Validators.required);
  lsComboNov: ComboMarcacion[] = [];
  lsComboPer: ComboPeriodo[] = [];
  lsComboUdn: ComboMarcacion[] = [];
  lsComboArea: ComboMarcacion[] = [];
  lsComboScc: ComboMarcacion[] = [];
  filteredPer!: Observable<ComboPeriodo[]>;
  filteredNov!: Observable<ComboMarcacion[]>;
  filteredUdn!: Observable<ComboMarcacion[]>;
  filteredArea!: Observable<ComboMarcacion[]>;
  filteredScc!: Observable<ComboMarcacion[]>;
  dataSource!: MatTableDataSource<Asistencia>;
  datamarca: any;

  solicitudPermiso!: SolcitudPermisoResponse;
  solicitudVacacion!: SolcitudVacacionResponse;
  solicitudJustificacion!: SolcitudJustificacionResponse;

  //columnsToDisplayWithExpand = [...this.displayedColumns, 'colaborador'];
  expandedElement!: SolicitudesA | null;
  expandedElement2!: SolicitudesA | null;
  listasolicitudes!: SolicitudesA[];
  lnov: string[] = [];

  constructor(
    private solicitudService: SolicitudService,
    private marcacionservice: MarcacionService,
    private toaster: ToastrService,
    private featureService: FeatureService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private router: Router

  ) {
    this.isFeatureActive = this.featureService.isFeatureActive(feaCodTurno);
  }

  ngOnInit(): void {
    if (!this.isFeatureActive)
      this.router.navigate(['/home']);
    this.consultarComboBitacoraMarcacionUdn();
    this.consultarComboNovedades();
    this.lnov=[];
  }

  RetornaNombreDia(fecha: string) {
    const dia = format(new Date(fecha), 'EEEE');

    if (dia === 'Monday') return 'Lunes';

    if (dia === 'Tuesday') return 'Martes';

    if (dia === 'Wednesday') return 'Miércoles';

    if (dia === 'Thursday') return 'Jueves';

    if (dia === 'Friday') return 'Viernes';

    if (dia === 'Saturday') return 'Sábado';

    if (dia === 'Sunday') return 'Domingo';

    return '';
  }
  openExcel(){
    this.dialog.open(DialogGenerar);
  }

  exportExcel() {
    try{
    let data1: ControlAsistencia[] = [];
    this.datamarca.forEach((e: Asistencia) => {
      if(e.novedades.length>0){
        e.novedades.forEach((n:Novedades)=>{
          data1.push({
            colaborador: e.colaborador,
            identificacion: e.identificacion,
            codBiometrico: e.codBiometrico,
            udn: e.udn,
            area: e.area,
            subCentroCosto: e.subCentroCosto,
            fecha: format((new Date(e.fecha)),'dd-MM-yyyy'),
            //idTurno: e.turnoLaboral.idTurno,
            entrada: format((new Date(e.turnoLaboral.entrada)),'HH:mm:ss') ?? '',
            //idMarcacionEntrada: e.turnoLaboral.idMarcacionEntrada,
            marcacionEntrada: format((new Date(e.turnoLaboral.marcacionEntrada)),'HH:mm:ss') ?? '',
            salida: format((new Date(e.turnoLaboral.salida)),'HH:mm:ss') ?? '',
            //idMarcacionSalida: e.turnoLaboral.idMarcacionEntrada,
            marcacionSalida: format((new Date(e.turnoLaboral.marcacionSalida)),'HH:mm:ss') ?? '',
            // totalHoras: e.turnoLaboral.totalHoras,
            //idSolicitudEntrada: e.turnoLaboral.idSolicitudEntrada,
            //idFeatureEntrada: e.turnoLaboral.idFeatureEntrada,
            estadoEntrada: e.turnoLaboral.estadoEntrada,
            //fechaSolicitudEntrada: e.turnoLaboral.fechaSolicitudEntrada,
            //usuarioSolicitudEntrada: e.turnoLaboral.usuarioSolicitudEntrada,
            //estadoSolicitudEntrada: e.turnoLaboral.estadoSolicitudEntrada,
            //idSolicitudSalida: e.turnoLaboral.idSolicitudSalida,
            //idFeatureSalida: e.turnoLaboral.idFeatureSalida,
            estadoSalida: e.turnoLaboral.estadoSalida,
            //fechaSolicitudSalida: e.turnoLaboral.fechaSolicitudSalida,
            //usuarioSolicitudSalida: e.turnoLaboral.usuarioSolicitudSalida,
            //estadoSolicitudSalida: e.turnoLaboral.estadoSolicitudSalida,
            //idTurnoR: e.turnoReceso.idTurno,
            entradaR: format((new Date(e.turnoReceso.entrada)),'HH:mm:ss') ?? '',
            //idMarcacionEntradaR: e.turnoReceso.idMarcacionEntrada,
            marcacionEntradaR: format((new Date(e.turnoReceso.marcacionEntrada)),'HH:mm:ss') ?? '',
            salidaR: format((new Date(e.turnoReceso.salida)),'HH:mm:ss') ?? '',
            //idMarcacionSalidaR: e.turnoReceso.idMarcacionSalida,
            marcacionSalidaR: format((new Date(e.turnoReceso.marcacionSalida)),'HH:mm:ss') ?? '',
            // totalHorasR: e.turnoReceso.totalHoras,
            //idSolicitudEntradaReceso: e.turnoReceso.idSolicitudEntradaReceso,
            //idFeatureEntradaReceso: e.turnoReceso.idFeatureEntradaReceso,
            // estadoEntradaReceso: e.turnoReceso.estadoEntradaReceso,
            //fechaSolicitudEntradaReceso: e.turnoReceso.fechaSolicitudEntradaReceso,
            //usuarioSolicitudEntradaReceso: e.turnoReceso.usuarioSolicitudEntradaReceso,
            //estadoSolicitudEntradaReceso: e.turnoReceso.estadoSolicitudEntradaReceso,
            //idSolicitudSalidaReceso: e.turnoReceso.idSolicitudSalidaReceso,
            //idFeatureSalidaReceso: e.turnoReceso.idFeatureSalidaReceso,
            // estadoSalidaReceso: e.turnoReceso.estadoSalidaReceso,
            //fechaSolicitudSalidaReceso: e.turnoReceso.fechaSolicitudSalidaReceso,
            // idMarcacionN: n.idMarcacion, kpi
            // idSolicitudN: n.idSolicitud, kpi
            // usuarioAprobadorN: n.usuarioAprobador,
            // fechaAprobacionN: n.fechaAprobacion,
            descripcionN: n.descripcion,
            minutosNovedadN: n.minutosNovedad,
            estadoMarcacionN: n.estadoMarcacion
          })
        });
      }else{
        data1.push({
          colaborador: e.colaborador,
          identificacion: e.identificacion,
          codBiometrico: e.codBiometrico,
          udn: e.udn,
          area: e.area,
          subCentroCosto: e.subCentroCosto,
          fecha: format((new Date(e.fecha)),'dd-MM-yyyy'),
          //idTurno: e.turnoLaboral.idTurno,
          entrada: format((new Date(e.turnoLaboral.entrada)),'HH:mm:ss') ?? '',
          //idMarcacionEntrada: e.turnoLaboral.idMarcacionEntrada,
          marcacionEntrada: format((new Date(e.turnoLaboral.marcacionEntrada)),'HH:mm:ss') ?? '',
          salida: format((new Date(e.turnoLaboral.salida)),'HH:mm:ss') ?? '',
          //idMarcacionSalida: e.turnoLaboral.idMarcacionEntrada,
          marcacionSalida: format((new Date(e.turnoLaboral.marcacionSalida)),'HH:mm:ss') ?? '',
          // totalHoras: e.turnoLaboral.totalHoras,
          //idSolicitudEntrada: e.turnoLaboral.idSolicitudEntrada,
          //idFeatureEntrada: e.turnoLaboral.idFeatureEntrada,
          estadoEntrada: e.turnoLaboral.estadoEntrada,
          //fechaSolicitudEntrada: e.turnoLaboral.fechaSolicitudEntrada,
          //usuarioSolicitudEntrada: e.turnoLaboral.usuarioSolicitudEntrada,
          //estadoSolicitudEntrada: e.turnoLaboral.estadoSolicitudEntrada,
          //idSolicitudSalida: e.turnoLaboral.idSolicitudSalida,
          //idFeatureSalida: e.turnoLaboral.idFeatureSalida,
          estadoSalida: e.turnoLaboral.estadoSalida,
          //fechaSolicitudSalida: e.turnoLaboral.fechaSolicitudSalida,
          //usuarioSolicitudSalida: e.turnoLaboral.usuarioSolicitudSalida,
          //estadoSolicitudSalida: e.turnoLaboral.estadoSolicitudSalida,
          //idTurnoR: e.turnoReceso.idTurno,
          entradaR: format((new Date(e.turnoReceso.entrada)),'HH:mm:ss') ?? '',
          //idMarcacionEntradaR: e.turnoReceso.idMarcacionEntrada,
          marcacionEntradaR: format((new Date(e.turnoReceso.marcacionEntrada)),'HH:mm:ss') ?? '',
          salidaR: format((new Date(e.turnoReceso.salida)),'HH:mm:ss') ?? '',
          //idMarcacionSalidaR: e.turnoReceso.idMarcacionSalida,
          marcacionSalidaR: format((new Date(e.turnoReceso.marcacionSalida)),'HH:mm:ss') ?? '',
          // totalHorasR: e.turnoReceso.totalHoras,
          //idSolicitudEntradaReceso: e.turnoReceso.idSolicitudEntradaReceso,
          //idFeatureEntradaReceso: e.turnoReceso.idFeatureEntradaReceso,
          // estadoEntradaReceso: e.turnoReceso.estadoEntradaReceso,
          //fechaSolicitudEntradaReceso: e.turnoReceso.fechaSolicitudEntradaReceso,
          //usuarioSolicitudEntradaReceso: e.turnoReceso.usuarioSolicitudEntradaReceso,
          //estadoSolicitudEntradaReceso: e.turnoReceso.estadoSolicitudEntradaReceso,
          //idSolicitudSalidaReceso: e.turnoReceso.idSolicitudSalidaReceso,
          //idFeatureSalidaReceso: e.turnoReceso.idFeatureSalidaReceso,
          // estadoSalidaReceso: e.turnoReceso.estadoSalidaReceso,
          //fechaSolicitudSalidaReceso: e.turnoReceso.fechaSolicitudSalidaReceso,
        });
      }


    });
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data1);
    const workbook: XLSX.WorkBook = { Sheets: { 'Empleados': worksheet }, SheetNames: ['Empleados'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xls', type: 'array' });

    const a = document.createElement('a');
    const blob = new Blob([excelBuffer], { type: 'application/vnd.ms-excel;charset=UTF-8' });
    const url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = 'exportCA' + new Date().getTime() + '.xls';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    }catch(_){
      this.toaster.warning('Error en la generación del archivo');
      //console.log(_);
    }
  }

  public exportAsExcelFile(json: any, excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { Empleados: worksheet },
      SheetNames: ['Empleados'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xls',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.displayedColumns,
      event.previousIndex,
      event.currentIndex
    );
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }
  mostrarTextoCombo(opcion: ComboMarcacion): string {
    return opcion && opcion.descripcion ? opcion.descripcion : '';
  }
  mostrarTextoComboPer(opcion: ComboPeriodo): string {
    return opcion && opcion.desPeriodo ? opcion.desPeriodo : '';
  }

  isControlEmpty(nombre: string): Boolean {
    if (nombre === 'UDN') return !this.ctrlComboUdn.value ? true : false;

    if (nombre === 'ARE') return !this.ctrlComboArea.value ? true : false;

    if (nombre === 'SCC') return !this.ctrlComboScc.value ? true : false;

    if (nombre === 'PER') return !this.ctrlComboPeriodo.value ? true : false;

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

    if (nombre === 'SCC') this.ctrlComboScc.setValue(undefined);

    if (nombre === 'PER') this.ctrlComboPeriodo.setValue(undefined);
  }
  consultarCombo(codigo: string, udn: string, area: string) {
    return this.marcacionservice.consultarComboBitacoraMarcacion(
      codigo,
      udn,
      area
    );
  }

  onSelectionUdn(option: ComboMarcacion, event: any) {
    if (event.isUserInput) {
      this.consultarComboBitacoraMarcacionArea(option.codigo);
      this.consultarComboBitacoraMarcacionPer(option.codigo);
      this.ctrlComboArea.setValue('');
      this.ctrlComboScc.setValue('');
      this.ctrlComboPeriodo.setValue('');
    }
  }

  onSelectionArea(option: ComboMarcacion, event: any) {
    // debugger;
    this.spinner.show();
    if (event.isUserInput) {
      this.ctrlComboScc.setValue('');
      this.consultarComboBitacoraMarcacionScc(
        this.ctrlComboUdn.value?.codigo,
        option.codigo
      );
    }
  }

  onSelectionPer(option: any) {}


  private _filterUdn(value: string): ComboMarcacion[] {
    const filterValue = value.toLowerCase();

    return this.lsComboUdn.filter((option) =>
      option.descripcion.toLowerCase().includes(filterValue)
    );
  }

  private _filterArea(value: string): ComboMarcacion[] {
    const filterValue = value.toLowerCase();

    return this.lsComboArea.filter((option) =>
      option.descripcion.toLowerCase().includes(filterValue)
    );
  }

  private _filterScc(value: string): ComboMarcacion[] {
    const filterValue = value.toLowerCase();

    return this.lsComboScc.filter((option) =>
      option.descripcion.toLowerCase().includes(filterValue)
    );
  }

  private _filterPer(value: string): ComboPeriodo[] {
    const filterValue = value.toLowerCase();

    return this.lsComboPer.filter((option) =>
      option.desPeriodo.toLowerCase().includes(filterValue)
    );
  }

  onSelectionScc(option: any) {}
  consultarComboBitacoraMarcacionUdn() {
    this.marcacionservice
      .consultarComboBitacoraMarcacion('UD', '', '')
      .subscribe((resp) => {
        if (resp.succeeded) {
          this.lsComboUdn = resp.data;
          this.filteredUdn = this.ctrlComboUdn.valueChanges.pipe(
            startWith(''),
            map((value) => {
              const name =
                typeof value === 'string' ? value : value?.descripcion;
              return name
                ? this._filterUdn(name as string)
                : this.lsComboUdn.slice();
            })
          );
        }
      });
  }
  changeSelectNov(novedades:Novedad[]){

    this.lnov=[];
    novedades.forEach(n => {
      this.lnov.push(n.codigo);
    });
    //console.log(this.lnov);
  }

  consultarComboNovedades() {
    this.marcacionservice
      .obtenerCatalogoNovedades('CA')
      .subscribe((resp) => {
        if (resp.succeeded) {
          this.lsComboNov = resp.data;
          //console.log(resp.data);
          this.selectAllForDropdownItems(this.lsComboNov);
          this.filteredNov = this.ctrlComboNov.valueChanges.pipe(
            startWith(''),
            map(value => this._filterNov(value || '')),
          );
          this.lsComboNov.forEach(item => {
            item['descripcion'] = `${item.descripcion}`;
            //item['selectedGroup'] = 'Todos';
          })
        }
      });
  }

  private _filterNov(value: string): Novedad[] {
    const filterValue = value.toLowerCase();
    return this.lsComboNov.filter(option => option.descripcion.toLowerCase().includes(filterValue));
  }

  consultarComboBitacoraMarcacionArea(udn: string) {
    this.marcacionservice
      .consultarComboBitacoraMarcacion('AR', udn, '')
      .subscribe((resp) => {
        if (resp.succeeded) {
          this.lsComboArea = resp.data;
          this.filteredArea = this.ctrlComboArea.valueChanges.pipe(
            startWith(''),
            map((value) => {
              const name =
                typeof value === 'string' ? value : value?.descripcion;
              return name
                ? this._filterArea(name as string)
                : this.lsComboArea.slice();
            })
          );
        }
      });
  }

  consultarComboBitacoraMarcacionPer(udn: string) {
    this.marcacionservice
      .obtenerPeriodos(udn)
      .subscribe((resp) => {
        if (resp.succeeded) {
          this.lsComboPer = resp.data;
          this.filteredPer = this.ctrlComboPeriodo.valueChanges.pipe(
            startWith(''),
            map((value) => {
              const name =
                typeof value === 'string' ? value : value?.desPeriodo;
              return name
                ? this._filterPer(name as string)
                : this.lsComboPer.slice();
            })
          );
        }
      });
  }

  selectAllForDropdownItems(items: any[]) {
    let allSelect = (items:any) => {
      items.forEach((element:any) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };
    allSelect(items);
    // items.push({codigo:'SN',descripcion:'SIN NOVEDAD'});
  }

  consultarComboBitacoraMarcacionScc(udn: string, area: string) {    
    this.marcacionservice
      .consultarComboBitacoraMarcacion('SC', udn, area)
      .subscribe((resp) => {
        if (resp.succeeded) {
          this.lsComboScc = resp.data;
          // this.filteredScc = of(this.lsComboScc);
          this.filteredScc = this.ctrlComboScc.valueChanges.pipe(
            startWith(''),
            map((value) => {
              const name =
                typeof value === 'string' ? value : value?.descripcion;
              return name
                ? this._filterScc(name as string)
                : this.lsComboScc.slice();
            })
          );
        }
        this.spinner.hide();
      });
  }
  detalleSolcitud(solicitud: any, tipo: string) {
    // console.log(tipo);
    if (tipo == 'PER') this.ConsultarSolicitudPermiso(solicitud);

    if (tipo == 'VAC') this.ConsultarSolicitudVacacion(solicitud);

    if (tipo == 'HEX') this.ConsultarSolicitudHoraExtra(solicitud);

    if (tipo == 'JUS')
      this.ConsultarSolicitudJustificacion(
        solicitud,
        '16D8E575-51A2-442D-889C-1E93E9F786B2'
      );
  }
  ConsultarSolicitudPermiso(id: string) {
    this.solicitudService.ConsultarSolicitudPermiso(id).subscribe((res) => {
      //console.log(res);
      if (res.succeeded) {
        //console.log(res.data);
        this.solicitudPermiso = res.data;
        this.dialog.open(DialogPermisos, {
          data: res.data,
        });
      }
    });
  }

  ConsultarSolicitudHoraExtra(id: string) {
    this.solicitudService.ConsultarSolicitudHorasExtras(id).subscribe((res) => {
      // console.log(res);
      if (res.succeeded) {
        //this.solicitudPermiso = res.data;
        this.dialog.open(DialogPermisos, {
          data: res.data,
        });
      }
    });
  }

  ConsultarSolicitudVacacion(id: string) {
    this.solicitudService.ConsultarSolicitudVacacion(id).subscribe((res) => {
      if (res.succeeded) {
        //console.log(res.data);
        this.solicitudVacacion = res.data;
        this.dialog.open(DialogPermisos, {
          data: res.data,
        });
      }
    });
  }

  ConsultarSolicitudJustificacion(id: string, feature: string) {
    this.solicitudService
      .ConsultarSolicitudJustificacion(id, feature)
      .subscribe((res) => {
        // console.log(res);
        if (res.succeeded) {
          this.solicitudJustificacion = res.data;
          this.dialog.open(DialogPermisos, {
            data: res.data,
          });
        }
      });
  }

  ConsultarNovedad(novedad: novedad) {
    //console.log(novedad);
    this.dialog.open(DialogNovedad, { data: novedad });
  }

  consultarAsistencia() {
    if (
      this.ctrlComboUdn.valid &&
      this.ctrlComboArea.valid &&
      this.ctrlComboScc.valid &&
      this.ctrlComboPeriodo.valid &&
      this.desdecontrol.valid &&
      this.hastacontrol.valid
    ) {
      this.spinner.show();
      this.marcacionservice
        .obtenerAsistencia(
          this.ctrlComboUdn.value.codigo,
          this.ctrlComboArea.value.codigo,
          this.ctrlComboScc.value.codigo,
          this.colaboradorcontrol.value,
          this.lnov.toString().replaceAll(',','-'),
          this.ctrlComboPeriodo.value.desPeriodo
        )
        .subscribe(
          (rsp: ResponseModel) => {
            this.datamarca = rsp.data;
            // console.log(rsp);
            this.dataSource = new MatTableDataSource<Asistencia>(
              this.datamarca
            );
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.spinner.hide();
          },
          () => {
            this.spinner.hide();
          }
        );
    } else {
      this.ctrlComboUdn.markAllAsTouched();
      this.ctrlComboArea.markAllAsTouched();
      this.ctrlComboScc.markAllAsTouched();
      this.desdecontrol.markAllAsTouched();
      this.hastacontrol.markAllAsTouched();
      this.ctrlComboPeriodo.markAllAsTouched();
    }
  }
}
@Component({
  selector: 'dialog-solicitudes',
  templateUrl: 'modalSolicitudes.html',
  styleUrls: ['./control-asistencia.component.scss'],
})
export class DialogPermisos {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
export class DialogVacaciones {
  constructor(@Inject(MAT_DIALOG_DATA) public data: SolicitudVacacion) {}
}
export class DialogJustificacion {
  constructor(@Inject(MAT_DIALOG_DATA) public data: SolicitudJustificacion) {}
}

export class DialogHorasExtras {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
@Component({
  selector: 'dialog-novedades',
  templateUrl: 'modalNovedades.html',
  styleUrls: ['./control-asistencia.component.scss'],
})
export class DialogNovedad {
  constructor(@Inject(MAT_DIALOG_DATA) public data: novedad[]) {}
}
export interface novedad {
  idMarcacion: number;
  descripcion: string;
  minutosNovedad: string;
  estadoMarcacion: string;
  fechaAprobacion: string;
}
@Component({
  selector: 'dialog-archivos',
  templateUrl: 'modalGenerarArchivo.html',
  styleUrls: ['./control-asistencia.component.scss'],
})
export class DialogGenerar {
  constructor() {}
}
export interface Novedad {
  codigo: string,
  descripcion: string
}
