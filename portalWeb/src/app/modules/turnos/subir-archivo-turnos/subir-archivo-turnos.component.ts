import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ResponseModel } from 'src/app/models/response.model';
import { TurnoMasivoColaborador } from 'src/app/models/turnos/asignacion-turno';
import { TurnosService } from 'src/app/services/turnos.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

const propArea = 'AREA';
const propDesArea = 'Desc_AREA';
const propCdc = 'CCOSTO';
const propDesCdc = 'Desc_CCOSTO';
const propScc = 'SUBCCOSTO';
const propDesScc = 'Desc_SUBCCOSTO';
const propIdentificacion = 'Identificacion';
const propEmpleado = 'Empleado';

//Nombres de columnas exportadas desde Panacea
const propArea2 = 'Area';
const propDesArea2 = 'Desc_Area';
const propCdc2 = 'Centro Costo';
const propDesCdc2 = 'Desc_Centro_Costo';
const propScc2 = 'Sub Centro Costo';
const propDesScc2 = 'Desc_SubCentroCosto';
const propIdentificacion2 = 'Identificacion';
const propEmpleado2 = 'Empleado';

@Component({
  selector: 'app-subir-archivo-turnos',
  templateUrl: './subir-archivo-turnos.component.html',
  styleUrls: ['./subir-archivo-turnos.component.scss']
})
export class SubirArchivoTurnosComponent implements OnInit {
  @ViewChild('fileUpload') inputFileUpload!: ElementRef;

  @Output() refreshTurnosAsigandos: EventEmitter<any> = new EventEmitter();

  title = 'XlsRead';
  file!: File;
  arrayBuffer: any;

  constructor(private turnoService: TurnosService, private toaster: ToastrService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void { }

  cargarInfoArchivoExcelTurnos(turnos: string) {
    this.spinner.show();

    this.turnoService.cargarInfoArchivoExcelTurnos(turnos)
      .subscribe((resp: ResponseModel) => {
        // console.log(resp)
        if (resp.succeeded) {
          this.refreshTurnosAsigandos.emit();
          this.toaster.success(resp.message);
        } else {
          this.toaster.warning(resp.message);
        }
        this.spinner.hide();
      }, () => { this.spinner.hide(); this.toaster.error('No se pudo establecer la conexión'); });
  }

  addfile(event: any) {
    // console.log(event.target.files[0])
    this.file = event.target.files[0];

    if (this.file) {
      let fileReader = new FileReader();
      fileReader.readAsArrayBuffer(this.file);
      fileReader.onload = (e) => {
        this.arrayBuffer = fileReader.result;
        var data = new Uint8Array(this.arrayBuffer);
        var arr = new Array();
        for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
        var bstr = arr.join("");
        var workbook = XLSX.read(bstr, { type: "binary" });
        var first_sheet_name = workbook.SheetNames[0];
        var worksheet = workbook.Sheets[first_sheet_name];

        var arraylist = XLSX.utils.sheet_to_json(worksheet, { raw: true });

        this.procesaArray(arraylist);
        this.inputFileUpload.nativeElement.value = "";
      }
    }
  }

  procesaArray(array: any[]) {
    //console.log(array);
    let turnos: TurnoMasivoColaborador[] = [];

    let info = array[0];
    // console.log(info)
    let keys: string[] = Object.keys(info);
    // console.log(keys)
    let values: string[] = Object.values(info);
    if (!this.esFormatoValido(keys)) {
      this.toaster.warning('Columnas de archivo no válidas');
      return;
    }

    if (!this.esFormatoValidoDobleFila(keys, values)) {
      this.toaster.warning('Columnas de cabecera no coinciden');
      return;
    }

    // se obtienen keys de fechas
    keys = this.depuraKeys(keys);

    if (keys.length === 0) {
      this.toaster.warning('Archivo no contiene turnos');
      return;
    }

    if (!this.esFormatoFechaDDMMYYYYValido(keys)) {
      this.toaster.warning('Formato fecha de columnas no válido');
      return;
    }

    // se elimina el primer objeto del arreglo
    array.shift();

    // se llena areglo de turnos
    array.forEach(x => {
      keys.forEach(key => {
        if (x[key])
          turnos.push({
            identificacion: x[propIdentificacion],
            codTurno: `${x[key]}-00`,
            fechaAsignacion: this.formatoYYYYMMDD(key)
          });
      });
    });

    // console.log(JSON.stringify(turnos));
    //this.inputFileUpload.nativeElement.value = "";

    Swal.fire({
      title: 'Se procederá con la carga del archivo, ¿ Continuar ?',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      width: 400
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.cargarInfoArchivoExcelTurnos(JSON.stringify(turnos));
      }
    });
  }

  depuraKeys(keys: string[]) {
    keys = keys.filter(x => x !== propArea);
    keys = keys.filter(x => x !== propDesArea);
    keys = keys.filter(x => x !== propCdc);
    keys = keys.filter(x => x !== propDesCdc);
    keys = keys.filter(x => x !== propScc);
    keys = keys.filter(x => x !== propDesScc);
    keys = keys.filter(x => x !== propEmpleado);
    keys = keys.filter(x => x !== propIdentificacion);

    //Caso de columnas exportadas desde panacea
    keys = keys.filter(x => x !== propArea2);
    keys = keys.filter(x => x !== propDesArea2);
    keys = keys.filter(x => x !== propCdc2);
    keys = keys.filter(x => x !== propDesCdc2);
    keys = keys.filter(x => x !== propScc2);
    keys = keys.filter(x => x !== propDesScc2);
    keys = keys.filter(x => x !== propEmpleado2);
    keys = keys.filter(x => x !== propIdentificacion2);

    return keys;
  }

  formatoYYYYMMDD(DDMMYYYY: string) {
    const f = DDMMYYYY.split('/');
    return `${f[2]}-${f[1]}-${f[0]}`;
  }

  esFormatoFechaDDMMYYYYValido(keys: string[]): boolean {
    console.log(keys);
    let res = true;

    keys.forEach(x => {
      const f = x.split('/');
      try {
        if (f[2].length < 4 || Number(f[1]) > 12) {
          res = false;
        }
      }
      catch(_) {

      }
    });

    return res;
  }

  esFormatoValidoDobleFila(keys: string[], values: string[]): boolean {
    const json1 = JSON.stringify(keys.toString().toUpperCase);
    const json2 = JSON.stringify(values.toString().toUpperCase);

    if (json1 === json2)
      return true;
    else
      return false;
  }

  esFormatoValido(keys: string[]): boolean {
    if (!keys.find(x => x === propArea || propArea2))
      return false;

    if (!keys.find(x => x === propDesArea || propDesArea2))
      return false;

    if (!keys.find(x => x === propCdc || propCdc2))
      return false;

    if (!keys.find(x => x === propDesCdc || propDesCdc2))
      return false;

    if (!keys.find(x => x === propScc || propScc2))
      return false;

    if (!keys.find(x => x === propDesScc || propDesScc2))
      return false;

    if (!keys.find(x => x === propEmpleado || propEmpleado2))
      return false;

    if (!keys.find(x => x === propIdentificacion || propIdentificacion2))
      return false;

    return true;
  }

}
