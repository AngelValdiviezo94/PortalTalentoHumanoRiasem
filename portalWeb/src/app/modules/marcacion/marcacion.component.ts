import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  ComboMarcacion,
  Marcacion,
} from 'src/app/models/marcaciones/marcaciones';
import { merge, Observable, of as observableOf, throwError } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import { FeatureService } from 'src/app/helper/feature.service';
import { environment } from 'src/environments/environment';
import { MarcacionService } from 'src/app/services/marcacion.service';
import { format, startOfMonth } from 'date-fns';
import { SolicitudesA } from 'src/app/models/marcaciones/asistencia';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Router } from '@angular/router';

const feaCodTurno = environment.codFeaMarcacion;
const atriCodGenerar = 'GEN';
const atriCodtxt = 'TXT';

@Component({
  selector: 'app-marcacion',
  templateUrl: './marcacion.component.html',
  styleUrls: ['./marcacion.component.scss'],
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
export class MarcacionComponent implements AfterViewInit, OnInit {
  ctrlComboUdn = new FormControl();
  ctrlComboArea = new FormControl();
  ctrlComboScc = new FormControl();
  fechaDesdeIni: Date = startOfMonth(new Date());
  eventocontrol = new FormControl();
  colaboradorcontrol = new FormControl('');
  desdecontrol = new FormControl(
    this.fechaDesdeIni.toISOString(),
    Validators.required
  );
  hastacontrol = new FormControl(new Date().toISOString(), Validators.required);
  lsComboUdn: ComboMarcacion[] = [];
  lsComboArea: ComboMarcacion[] = [];
  lsComboScc: ComboMarcacion[] = [];
  isFeatureActive: boolean;
  isAtrTxtActive: boolean;
  isAtrGenerarActive: boolean;
  filteredUdn!: Observable<ComboMarcacion[]>;
  filteredArea!: Observable<ComboMarcacion[]>;
  filteredScc!: Observable<ComboMarcacion[]>;
  filteredOptions2!: Observable<ComboMarcacion[]>;
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });
  displayedColumns: string[] = [
    'udn',
    'area',
    'subcentroCosto',
    'codigo',
    'cedula',
    'nombre',
    'fecha',
    'hora',
    'evento',
    'novedad',
    'minutos',
  ];
  expandedElement!: SolicitudesA | null;
  datamarca: any;
  especiales: any;
  combo: any;
  combo2: any;
  combo3: any;
  combo4: any;
  fileUrl: any;
  options2: ComboMarcacion[] = [];

  evento: string | undefined = '';

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(
      this.displayedColumns,
      event.previousIndex,
      event.currentIndex
    );
  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  dataSource!: MatTableDataSource<Marcacion>;

  constructor(
    private marcacionservice: MarcacionService,
    private toaster: ToastrService,
    private featureService: FeatureService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {
    this.isAtrGenerarActive = this.featureService.isAtributoActive(
      feaCodTurno,
      atriCodGenerar
    );
    this.isAtrTxtActive = this.featureService.isAtributoActive(
      feaCodTurno,
      atriCodtxt
    );
    this.isFeatureActive = this.featureService.isFeatureActive(feaCodTurno);
  }

  ngOnInit() {
    if (!this.isFeatureActive) this.router.navigate(['/home']);

    this.consultarComboBitacoraMarcacionUdn();
    this.marcacionservice
      .consultarComboBitacoraMarcacion('TM', '', '')
      .subscribe((data) => {
        this.combo2 = data;
        this.options2 = this.combo2.data;
        this.filteredOptions2 = this.eventocontrol.valueChanges.pipe(
          startWith(''),
          map((value) => {
            const name = typeof value === 'string' ? value : value?.descripcion;
            return name
              ? this._filter(name as string, this.options2)
              : this.options2.slice();
          })
        );
      });
    var desden = format(
      new Date(this.desdecontrol.value as string),
      'yyyy-MM-dd'
    );
    var hastan = format(
      new Date(this.hastacontrol.value as string),
      'yyyy-MM-dd'
    );
  }
  private _filter(value: string, optionsV: ComboMarcacion[]): ComboMarcacion[] {
    const filterValue = value.toLowerCase();

    return optionsV.filter((option) =>
      option.descripcion.toLowerCase().includes(filterValue)
    );
  }

  ngAfterViewInit() {
    this.paginator._intl.itemsPerPageLabel = 'Registros por página';
    this.paginator._intl.nextPageLabel = 'Siguiente página';
    this.paginator._intl.previousPageLabel = 'Página anterior';
    this.paginator._intl.lastPageLabel = 'Última página';
    this.paginator._intl.firstPageLabel = 'Primera página';
  }

  isControlEmpty(nombre: string): Boolean {
    if (nombre === 'UDN') return !this.ctrlComboUdn.value ? true : false;

    if (nombre === 'ARE') return !this.ctrlComboArea.value ? true : false;

    if (nombre === 'SCC') return !this.ctrlComboScc.value ? true : false;

    if (nombre === 'TUR') return !this.eventocontrol.value ? true : false;

    if (nombre === 'COL') return this.colaboradorcontrol.value === '' ? true : false;

    return true;
  }
  limpiarControl(nombre: String): void {
    if (nombre === 'UDN') {
      this.ctrlComboUdn.setValue('');
      this.ctrlComboArea.setValue('');
      this.ctrlComboScc.setValue('');
      this.filteredArea = new Observable<ComboMarcacion[]>();
      this.filteredScc = new Observable<ComboMarcacion[]>();
    }

    if (nombre === 'ARE') {
      this.ctrlComboArea.setValue('');
      this.ctrlComboScc.setValue('');
      this.filteredScc = new Observable<ComboMarcacion[]>();
    }

    if (nombre === 'SCC') this.ctrlComboScc.setValue('');

    if (nombre === 'TUR') this.eventocontrol.setValue('');

    if (nombre === 'COL') this.colaboradorcontrol.setValue('');
  }

  consultarMarcacion(desde: string, hasta: string) {
    if (
      this.desdecontrol.value == null ||
      this.hastacontrol.value == null ||
      this.desdecontrol.value == '' ||
      this.hastacontrol.value == ''
    ) {
      this.toaster.warning('Seleccionar fechas a buscar');
    } else if (this.hastacontrol.value < this.desdecontrol.value) {
      this.toaster.warning(
        '"Fecha desde" no puede ser mayor que la "fecha hasta"'
      );
    } else {
      this.spinner.show();
      this.marcacionservice
        .obtenerMarcaciones(
          this.ctrlComboUdn.value?.codigo || '',
          this.ctrlComboArea.value?.codigo || '',
          this.ctrlComboScc.value?.codigo || '',
          this.colaboradorcontrol.value || '',
          this.eventocontrol.value?.codigo || '',
          desde,
          hasta
        )
        .subscribe(
          (data) => {
            this.datamarca = data;
            this.dataSource = new MatTableDataSource<Marcacion>(
              this.datamarca.data
            );
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.spinner.hide();
          },
          () => {
            this.spinner.hide();
          }
        );
    }
  }

  consultarMarcacionEspecial() {
    var desden = format(
      new Date(this.desdecontrol.value as string),
      'yyyy-MM-dd'
    );
    var hastan = format(
      new Date(this.hastacontrol.value as string),
      'yyyy-MM-dd'
    );
    this.spinner.show();
    // console.log(desden + ' ' + hastan);
    this.marcacionservice
      .obtenerMarcacionesEspeciales(desden, hastan)
      .subscribe(
        (data) => {
          // console.log(data)
          this.especiales = data;
          var data1 = this.especiales.data;

          var estado: number;
          let dataP: string[] = [];
          data1.forEach(function (value: any) {
            if (value.codEvento == 10) {
              estado = 0;
              dataP.push(
                `${value.codigo}\t${value.fechaHora}\t1\t${estado}\t1\t0`
              );
            } else if (value.codEvento == 11) {
              estado = 1;
              dataP.push(
                `${value.codigo}\t${value.fechaHora}\t1\t${estado}\t1\t0`
              );
            } else {
            }
          });
          let file = new Blob([`${dataP.toString().split(',').join('\r\n')}`], {
            type: 'text/plain',
          });
          //console.log(`${dataP.toString().split(',').join('')}`);
          let a = document.createElement('a'),
            url = URL.createObjectURL(file);
          a.href = url;
          a.download = 'MarcacionEspecial';
          document.body.appendChild(a);
          a.click();
          setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 0);
          this.spinner.hide();
        },
        () => {
          this.spinner.hide();
        }
      );
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
      this.ctrlComboArea.setValue('');
      this.ctrlComboScc.setValue('');
    }
  }

  onSelectionArea(option: ComboMarcacion, event: any) {
    this.spinner.show();
    if (event.isUserInput) {
      this.ctrlComboScc.setValue('');
      this.consultarComboBitacoraMarcacionScc(
        this.ctrlComboUdn.value?.codigo,
        option.codigo
      );
    }
  }

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
  onSelectionScc(option: any) {}

  excelStart() {
    this.spinner.show();
  }
  excelComplete() {
    this.spinner.hide();
  }

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

  consultarComboBitacoraMarcacionScc(udn: string, area: string) {
    this.marcacionservice
      .consultarComboBitacoraMarcacion('SC', udn, area)
      .subscribe((resp) => {
        if (resp.succeeded) {
          this.lsComboScc = resp.data;
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

  download() {
    var data = this.datamarca.data;
    var estado: number;
    let dataP: string[] = [];
    data.forEach(function (value: any) {
      if (value.codEvento == 10) {
        estado = 0;
        dataP.push(`${value.codigo}\t${value.fechaHora}\t1\t${estado}\t1\t0`);
      } else if (value.codEvento == 11) {
        estado = 1;
        dataP.push(`${value.codigo}\t${value.fechaHora}\t1\t${estado}\t1\t0`);
      } else {
      }
      // else if(value.codEvento==14){
      //   estado = 4;
      // }else if(value.codEvento==15){
      //   estado = 5;
      // }
    });
    let file = new Blob([`${dataP.toString().split(',').join('\r\n')}`], {
      type: 'text/plain',
    });
    //console.log(`${dataP.toString().split(',').join('')}`);
    let a = document.createElement('a'),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = 'Marcacion';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  downloadEspecial() {
    // const [month, day, year] = desde.split('/');
    // const [month2, day2, year2] = hasta.split('/');
    // console.log(desde+' '+hasta)

    this.consultarMarcacionEspecial();
  }

  mostrarTextoCombo(opcion: ComboMarcacion): string {
    return opcion && opcion.descripcion ? opcion.descripcion : '';
  }

  exportExcel() {
    this.excelStart();
    let data1: Marcacion[] = [];
    this.datamarca.data.forEach((e: Marcacion) => {
      data1.push({
        udn: e.udn,
        area: e.area,
        subcentroCosto: e.subcentroCosto,
        cedula: e.cedula,
        codigo: e.codigo,
        nombre: e.nombre,
        fecha: e.fecha,
        hora: e.hora,
        evento: e.evento,
        novedad: e.novedad,
        minutos_novedad: e.minutos_novedad,
      });
    });

    // const replacer = (key: any, value: any) => (value === null ? '' : value); // specify how you want to handle null values here
    // const header = Object.keys(data1[0]);
    // const csv = data1.map((row: any) =>
    //   header
    //     .map((fieldName) => JSON.stringify(row[fieldName], replacer))
    //     .join('\t')
    // );
    // csv.unshift(header.join('\t'));
    // const csvArray = csv.join('\r\n');

    const a = document.createElement('a');

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data1);
    const workbook: XLSX.WorkBook = {
      Sheets: { Marcaciones: worksheet },
      SheetNames: ['Marcaciones'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xls',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.ms-excel;charset=UTF-8',
    });
    const url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = 'exportExcel' + new Date().getTime() + '.xls';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    this.excelComplete();
  }
}
