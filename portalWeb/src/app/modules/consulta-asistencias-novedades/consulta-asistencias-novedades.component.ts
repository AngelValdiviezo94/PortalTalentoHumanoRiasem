import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { format, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { map, Observable, startWith } from 'rxjs';
import { GestionService } from 'src/app/helper/gestion.service';
import { Cliente } from 'src/app/models/cliente/cliente.model';
import { Asistencia, AsistenciaNovedad, Novedades } from 'src/app/models/marcaciones/asistencia';
import { ComboMarcacion } from 'src/app/models/marcaciones/marcaciones';
import { ResponseModel } from 'src/app/models/response.model';
import { MarcacionService } from 'src/app/services/marcacion.service';
import { TurnosService } from 'src/app/services/turnos.service';
import { DialogNovedad } from '../control-asistencia/control-asistencia.component';

@Component({
  selector: 'app-consulta-asistencias-novedades',
  templateUrl: './consulta-asistencias-novedades.component.html',
  styleUrls: ['./consulta-asistencias-novedades.component.scss']
})
export class ConsultaAsistenciasNovedadesComponent implements OnInit {
  fechaDesdeIni: Date = startOfMonth(new Date());

  ctrlComboUdn = new FormControl(undefined as any);
  ctrlComboArea = new FormControl(undefined as any);
  ctrlComboScc = new FormControl(undefined as any);
  ctrlColaborador = new FormControl(undefined as any, Validators.required);
  ctrlFechaDesde = new FormControl(this.fechaDesdeIni, Validators.required);
  ctrlFechaHasta = new FormControl(new Date(), Validators.required);
  ctrlNovedad = new FormControl(undefined as any, Validators.required);

  lsComboUdn: ComboMarcacion[] = [];
  lsComboArea: ComboMarcacion[] = [];
  lsComboScc: ComboMarcacion[] = [];
  lsColaborador: ComboMarcacion[] = [];
  lsComboNovedad: ComboMarcacion[] = [];

  filteredUdn!: Observable<ComboMarcacion[]>;
  filteredArea!: Observable<ComboMarcacion[]>;
  filteredScc!: Observable<ComboMarcacion[]>;

  dataGrid!: MatTableDataSource<any>;
  columnasGrid = ['udn', 'colaborador', 'identificacion', 'fecha', 'dia', 'entradaLaboral',
    'marcacionEntrada', 'salidaLaboral', 'marcacionSalida', 'entradaReceso',
    'marcacionEntradaReceso', 'salidaReceso', 'marcacionSalidaReceso', 'novedad'];
  // columnsToDisplayWithExpand = [...this.columnasGrid, 'expand'];

  constructor(private marcacionService: MarcacionService, public turnoservice: TurnosService, public dialog: MatDialog,
    private gestionService: GestionService, private toaster: ToastrService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    //this.consultarComboBitacoraMarcacionUdn();
    this.consultarEmpleados(this.gestionService.obtenerSuscriptorUidLocal());
    this.consultarComboNovedades();
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
          // (area);
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

  consultarEmpleados(uidPadre: string) {
    this.turnoservice.consultarEmpleados(uidPadre)
      .subscribe(resp => {
        if (resp.succeeded) {
          const lsCola: Cliente[] = resp.data;
          let valCol: ComboMarcacion[] = [];

          lsCola.forEach(item => {
            valCol.push({
              codigo: item.identificacion,
              descripcion: `${item.apellidos} ${item.nombres.split(' ')[0]}`,
              selectedGroup: 'Todos'
            });
          });

          this.lsColaborador = valCol;
        }
      })
  }

  consultarComboNovedades() {
    this.marcacionService.obtenerCatalogoNovedades('CN')
      .subscribe((resp) => {
        if (resp.succeeded) {
          const lsNov: ComboMarcacion[] = resp.data;

          lsNov.forEach(item => {
            item['selectedGroup'] = 'Todos';
          });

          this.lsComboNovedad = lsNov;
        }
      });
  }

  consultaAsistenciasNovedades(fechaDesde: string, fechasHasta: string, lsNovedad: string, lsColaborador: string) {
    this.spinner.show();
    this.marcacionService.ConsultaAsistenciasNovedades(fechaDesde, fechasHasta, lsNovedad, lsColaborador)
      .subscribe({
        next: (resp: ResponseModel) => {
          (resp);
          // console.log(resp)
          // this.dataGrid = resp.data;
          let info: Asistencia[] = resp.data;
          let asistenciaNovedad: AsistenciaNovedad[] = [];
          info.map(x => {
            asistenciaNovedad.push({
              udn: x.udn || '',
              colaborador: x.colaborador,
              identificacion: x.identificacion,
              fecha: new Date(x.fecha),
              dia: format(new Date(x.fecha), 'EEEE', { locale: es }),
              entradaLaboral: this.retornaFechaFormato(x.turnoLaboral.entrada),
              marcacionEntrada: this.retornaFechaFormato(x.turnoLaboral.marcacionEntrada),
              estadoEntrada: x.turnoLaboral.estadoEntrada,
              salidaLaboral: this.retornaFechaFormato(x.turnoLaboral.salida),
              marcacionSalida: this.retornaFechaFormato(x.turnoLaboral.marcacionSalida),
              estadoSalida: x.turnoLaboral.estadoSalida,
              entradaReceso: this.retornaFechaFormato(x.turnoReceso.entrada),
              marcacionEntradaReceso: this.retornaFechaFormato(x.turnoReceso.marcacionEntrada),
              estadoEntradaReceso: x.turnoReceso.estadoEntradaReceso,
              salidaReceso: this.retornaFechaFormato(x.turnoReceso.salida),
              marcacionSalidaReceso: this.retornaFechaFormato(x.turnoReceso.marcacionSalida),
              estadoSalidaReceso: x.turnoReceso.estadoSalidaReceso,
              novedad: x.novedades
            });
          });

          //  (rsp.data);
          this.dataGrid = new MatTableDataSource<any>(
            asistenciaNovedad
          );

          this.spinner.hide();
        },
        error: () => {
          this.spinner.hide();
          this.toaster.error('No se pudo establecer la conexión');
        }
      });
  }

  retornaFechaFormato(fecha: Date | string, segundos: boolean = false): string {
    if (fecha)
      return format(new Date(fecha), segundos ? 'HH:mm:ss' : 'HH:mm');

    return '';
  }

  changeSelectCola(cola: any[]) { }

  changeSelectNov(nov: any[]) { }

  consultarNovedad(novedades: Novedades) {
    this.dialog.open(DialogNovedad, { data: novedades });

  }

  buscarSolicitudes() {

    if (this.ctrlFechaDesde.valid && this.ctrlFechaHasta.valid && this.ctrlNovedad.valid && this.ctrlColaborador.valid) {
      // `${format(new Date(this.ctrlFechaHasta.value!), 'yyyy-MM-dd')} 23:59:59`);
      if (this.ctrlFechaHasta.value! < this.ctrlFechaDesde.value!) {
        this.toaster.warning('"Fecha desde" no puede ser mayor que la "fecha hasta"');
        return;
      }

      // let udn = this.ctrlComboUdn.value || '';
      // let area = this.ctrlComboArea.value || '';
      // let scc = this.ctrlComboScc.value || '';
      let colaborador: string[] = this.ctrlColaborador.value || [];
      let novedad = this.ctrlNovedad.value || [];
      let fechaDesde = `${format(new Date(this.ctrlFechaDesde.value!), 'yyyy-MM-dd')} 00:00:00`;
      let fechaHasta = `${format(new Date(this.ctrlFechaHasta.value!), 'yyyy-MM-dd')} 23:59:59`;

      let stringCola = this.concatenaStringArray(colaborador, ',');
      let stringNove = this.concatenaStringArray(novedad, ',');

      this.consultaAsistenciasNovedades(fechaDesde, fechaHasta, stringNove, stringCola);
    } else {
      // this.ctrlComboUdn.markAllAsTouched();
      // this.ctrlComboArea.markAllAsTouched();
      // this.ctrlComboScc.markAllAsTouched();
      this.ctrlFechaDesde.markAllAsTouched();
      this.ctrlFechaHasta.markAllAsTouched();
      this.ctrlNovedad.markAllAsTouched();
      this.ctrlColaborador.markAllAsTouched();
    }

  }

  concatenaStringArray(array: string[], delimitador: string) {
    let stringConc = '';

    array.forEach((e, i) => {
      stringConc += e;
      if (i < array.length - 1)
        stringConc += delimitador;
    });

    return stringConc;
  }

  limpiarControl(nombre: String): void {
    if (nombre === 'UDN') {
      this.ctrlComboUdn.setValue(undefined);
      this.ctrlComboArea.setValue(undefined);
      this.ctrlComboScc.setValue(undefined);
    }

    if (nombre === 'ARE') {
      this.ctrlComboArea.setValue(undefined);
      this.ctrlComboScc.setValue(undefined);
    }

    if (nombre === 'SCC') this.ctrlComboScc.setValue(undefined);

    if (nombre === 'COL') this.ctrlColaborador.setValue(undefined);
    // if (nombre === 'PER') this.ctrlComboPeriodo.setValue(undefined);
  }

  isControlEmpty(nombre: string): Boolean {
    if (nombre === 'UDN') return !this.ctrlComboUdn.value ? true : false;

    if (nombre === 'ARE') return !this.ctrlComboArea.value ? true : false;

    if (nombre === 'SCC') return !this.ctrlComboScc.value ? true : false;

    if (nombre === 'COL') return !this.ctrlColaborador.value ? true : false;
    //if (nombre === 'PER') return !this.ctrlComboPeriodo.value ? true : false;

    return true;
  }

  mostrarTextoCombo(opcion: ComboMarcacion): string {
    return opcion && opcion.descripcion ? opcion.descripcion : '';
  }

  onSelectionUdn(option: ComboMarcacion, event: any) {
    if (event.isUserInput) {
      this.consultarComboBitacoraMarcacionArea(option.codigo);
      // this.consultarComboBitacoraMarcacionPer(option.codigo);
      this.ctrlComboArea.setValue('');
      this.ctrlComboScc.setValue('');
      // this.ctrlComboPeriodo.setValue('');
    }
  }

  onSelectionArea(option: ComboMarcacion, event: any) {
    // console.log(option, this.ctrlComboArea.value);
    this.spinner.show()
    if (event.isUserInput) {
      this.ctrlComboScc.setValue('');
      this.consultarComboBitacoraMarcacionScc(this.ctrlComboUdn.value?.codigo, option.codigo);
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

  retornaClaseCss(estado: string): string {
    if (estado == 'TA') return 'color-TA';
    if (estado == 'NT') return 'color-NT';
    if (estado == 'NS') return 'color-NS';
    if (estado == 'AI') return 'color-AI'
    if (estado == 'AJ') return 'color-AJ';
    if (estado == 'SI') return 'color-SI';
    if (estado == 'SJ') return 'color-SJ';
    if (estado == 'ER') return 'color-ER';
    if (estado == 'NR') return 'color-NR';
    if (estado == 'FJ') return 'color-FJ';
    if (estado == 'FI') return 'color-FI';
    if (estado == 'LV') return 'color-LV';
    if (estado == 'SN') return 'color-SN';
    return '';
  }

}
