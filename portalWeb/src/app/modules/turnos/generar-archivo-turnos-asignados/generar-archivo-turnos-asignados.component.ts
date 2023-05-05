import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { format, startOfMonth } from 'date-fns';
import { map, Observable, startWith } from 'rxjs';
import { ResponseModel } from 'src/app/models/response.model';
import { MarcacionService } from 'src/app/services/marcacion.service';
import { TurnosService } from 'src/app/services/turnos.service';
import Swal from 'sweetalert2';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ComboMarcacion } from 'src/app/models/marcaciones/marcaciones';

//const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_TYPE = 'application/vnd.ms-excel;charset=UTF-8';
const EXCEL_EXTENSION = '.xls';

@Component({
  selector: 'app-generar-archivo-turnos-asignados',
  templateUrl: './generar-archivo-turnos-asignados.component.html',
  styleUrls: ['./generar-archivo-turnos-asignados.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GenerarArchivoTurnosAsignadosComponent implements OnInit {
  @ViewChild('modalArchvivoTurnosAsignados', { static: true }) modalTurnoAsignados!: TemplateRef<any>;

  @Output() eventCloseModal: EventEmitter<any> = new EventEmitter();

  fechaDesdeIni: Date = startOfMonth(new Date());

  ctrlComboUdn = new FormControl(undefined as any, Validators.required);
  ctrlComboArea = new FormControl();
  ctrlComboScc = new FormControl();
  ctrlFechaDesde = new FormControl(this.fechaDesdeIni.toISOString(), Validators.required);
  ctrlFechaHasta = new FormControl(new Date().toISOString(), Validators.required);

  lsComboUdn: ComboMarcacion[] = [];
  lsComboArea: ComboMarcacion[] = [];
  lsComboScc: ComboMarcacion[] = [];

  filteredUdn!: Observable<ComboMarcacion[]>;
  filteredArea!: Observable<ComboMarcacion[]>;
  filteredScc!: Observable<ComboMarcacion[]>;

  procesando: boolean = false;

  constructor(public dialog: MatDialog, private marcacionService: MarcacionService,
    private turnoservice: TurnosService, private toaster: ToastrService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.consultarComboBitacoraMarcacionUdn();
  }

  closeModal() {
    this.eventCloseModal.emit();
    this.dialog.closeAll();
  }

  GenerarArchivo() {
    if (this.ctrlComboUdn.valid && this.ctrlFechaDesde.valid && this.ctrlFechaHasta.valid) {
      this.ConsultarTurnosAsignadosExcel(
        this.ctrlComboUdn.value?.codigo || '',
        this.ctrlComboArea.value?.codigo || '',
        this.ctrlComboScc.value?.codigo || '',
        `${format(new Date(this.ctrlFechaDesde.value as string), 'yyyy-MM-dd')} 00:00:00`,
        `${format(new Date(this.ctrlFechaHasta.value as string), 'yyyy-MM-dd')} 23:59:59`,
      );
    } else {
      this.ctrlComboUdn.markAllAsTouched();
      this.ctrlFechaDesde.markAllAsTouched();
      this.ctrlFechaHasta.markAllAsTouched();
    }
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

  ConsultarTurnosAsignadosExcel(udn: string, area: string, scc: string, fechaDesde: string, fechaHasta: string) {
    this.procesando = true;
    this.turnoservice.consultarTurnosAsignadosExcel(udn, area, scc, fechaDesde, fechaHasta)
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded) {
          let dataExcelObject = JSON.parse(resp.data);
          let newRow: any = undefined;

          if (dataExcelObject.length > 0) {
            newRow = JSON.parse(resp.data)[0];

            let keys: string[] = Object.keys(newRow);

            keys.forEach(property => {
              newRow[property] = property;
            });
          }

          dataExcelObject = dataExcelObject.sort((a: any, b: any) => (a.Empleado < b.Empleado) ? -1 : 1);

          if (newRow !== undefined)
            dataExcelObject.unshift(newRow);

          this.exportAsExcelFile(dataExcelObject, 'archivo_turnos');
        } else {
          this.toaster.success(resp.message);
        }
        this.procesando = false;
      }, () => {
        this.procesando = false;
        this.toaster.error('No se pudo establecer la conexión');
      });
  }

  public exportAsExcelFile(json: any, excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = { Sheets: { 'Empleados': worksheet }, SheetNames: ['Empleados'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xls', type: 'array' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    this.closeModal();
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
    if (event.isUserInput) {
      this.consultarComboBitacoraMarcacionArea(option.codigo);
      this.ctrlComboArea.setValue('');
      this.ctrlComboScc.setValue('');
    }
  }

  onSelectionArea(option: ComboMarcacion, event: any) {
    if (event.isUserInput) {
      this.spinner.show();
      this.ctrlComboScc.setValue('');
      this.consultarComboBitacoraMarcacionScc(this.ctrlComboUdn.value?.codigo, option.codigo);
    }
  }

  onSelectionScc(option: any) {
    // console.log(option);
  }


  isControlEmpty(nombre: string): Boolean {
    if (nombre === 'UDN')
      return this.ctrlComboUdn.value === '' ? true : false;

    if (nombre === 'ARE')
      return this.ctrlComboArea.value === '' ? true : false;

    if (nombre === 'SCC')
      return this.ctrlComboScc.value === '' ? true : false;

    return true;
  }

  limpiarControl(nombre: String): void {
    if (nombre === 'UDN') {
      this.ctrlComboUdn.setValue(undefined);
      this.ctrlComboArea.setValue('');
      this.ctrlComboScc.setValue('');
    }

    if (nombre === 'ARE') {
      this.ctrlComboArea.setValue('');
      this.ctrlComboScc.setValue('');
    }

    if (nombre === 'SCC')
      this.ctrlComboScc.setValue('');
  }

  mostrarTextoCombo(opcion: ComboMarcacion): string {
    return opcion && opcion.descripcion ? opcion.descripcion : '';
  }

}
