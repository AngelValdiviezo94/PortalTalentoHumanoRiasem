import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { format } from 'date-fns';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { map, Observable, of, startWith } from 'rxjs';
import { GestionService } from 'src/app/helper/gestion.service';
import { TokenService } from 'src/app/helper/token.service';
import { Empleado } from 'src/app/models/cliente/empleado.interface';
import { ResponseModel } from 'src/app/models/response.model';
import {
  AdjuntoRequest,
  DiasJustificarResponse,
  SolicitudJustificacionRequest,
} from 'src/app/models/solicitud/solicitud-justificacion.interacion';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { TurnosService } from 'src/app/services/turnos.service';
import Swal from 'sweetalert2';

const idFeatureJustificacion = '16D8E575-51A2-442D-889C-1E93E9F786B2';

interface DiasJustificar {
  descripcion: string;
  estadoMarcacion: string;
  estadoSolicitud: string;
  fechaMarcacion: string;
  idSolicitud: string;
  marcacionId: string;
  tipoMarcacion: string;
  descripcionCombo: string;
}

@Component({
  selector: 'app-justificacion-registrar-solicitud',
  templateUrl: './justificacion-registrar-solicitud.component.html',
  styleUrls: ['./justificacion-registrar-solicitud.component.scss'],
})
export class JustificacionRegistrarSolicitudComponent implements OnInit {
  @Input() cliente!: Empleado;

  empleado!: Empleado;

  ctrlColaborador = new FormControl('');
  filteredColaborador!: Observable<Empleado[]>;
  lsEmpleado: Empleado[] = [];
  flagBeneficiario: boolean = true;

  formJustificacionTocuched: boolean = false;

  lstDiasJustificar!: Observable<DiasJustificar[]>;
  selectedIdMarcacion!: string;
  diasJustificar: DiasJustificar[] = [];

  lstTipoJustificacion!: Observable<any[]>;
  selectedIdTipoJustificacion!: string;

  comentario = new FormControl('', [Validators.maxLength(300), Validators.required]);
  colSelected: any = undefined;
  files: File[] = [];
  fileBase64: string = '';
  codTipSolGen: string = '1';

  loadingComboCola: boolean = false;

  constructor(
    private serviceSolicitud: SolicitudService,
    private tokenService: TokenService,
    private spinner: NgxSpinnerService,
    private toaster: ToastrService,
    private gestionService: GestionService,
    private turnoService: TurnosService
  ) { }

  ngOnInit(): void {
    this.ctrlColaborador.setValue(
      this.cliente.apellidos + ' ' + this.cliente.nombres
    );
    this.obtenerEmpleados();
    this.ConsultarDiasJustificarN();
    this.ConsultarTipoJustificacion();
  }

  // ConsultarDiasJustificar() {
  //   this.serviceSolicitud.ConsultarDiasJustificar(this.tokenService.getIdentificacion())
  //     .subscribe((resp: ResponseModel) => {
  //       if (resp.succeeded) {
  //         this.diasJustificar = resp.data;
  //         this.diasJustificar.map(x => {
  //           x.descripcionCombo = `${format(new Date(x.fechaMarcacion), 'yyyy-MM-dd')} (${x.descripcion})`
  //         });
  //         this.lstDiasJustificar = of(this.diasJustificar);
  //       }
  //     });
  // }
  ConsultarDiasJustificarN() {
    this.diasJustificar = [];
    if (this.flagBeneficiario) {
      this.serviceSolicitud
        .ConsultarDiasJustificarN(this.cliente.identificacion)
        .subscribe((resp: ResponseModel) => {
          if (resp.data != null) {
            this.diasJustificar = resp.data;
            this.diasJustificar.map((x) => {
              x.descripcionCombo = `${format(
                new Date(x.fechaMarcacion),
                'dd/MM/yyyy'
              )} (${x.descripcion})`;
            });
            this.lstDiasJustificar = of(this.diasJustificar);
          }
        });
    } else {
      this.serviceSolicitud
        .ConsultarDiasJustificarN(this.empleado.identificacion)
        .subscribe((resp: ResponseModel) => {
          if (resp.data != null) {
            this.diasJustificar = resp.data;
            this.diasJustificar.map((x) => {
              x.descripcionCombo = `${format(
                new Date(x.fechaMarcacion),
                'dd/MM/yyyy'
              )} (${x.descripcion})`;
            });
            this.lstDiasJustificar = of(this.diasJustificar);
          }
        });
    }
  }

  ConsultarTipoJustificacion() {
    this.serviceSolicitud
      .ConsultarTipoJustificacion()
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded) this.lstTipoJustificacion = of(resp.data);
      });
  }

  CrearSolicitudJustificacion(justificacion: SolicitudJustificacionRequest) {
    this.spinner.show();
    this.serviceSolicitud.CrearSolicitudJustificacion(justificacion).subscribe(
      (resp: ResponseModel) => {
        if (resp.succeeded && resp.statusCode === '100') {
          this.LimpiarFormJustificacion();
          this.toaster.success(resp.message, 'Información');
        } else {
          this.toaster.warning(resp.message, 'Información');
        }
        this.spinner.hide();
      },
      () => {
        this.toaster.error('No se pudo establecer la conexión');
        this.spinner.hide();
      }
    );
  }

  obtenerEmpleados() {
    this.loadingComboCola = true;
    var uid = this.gestionService.obtenerSuscriptorUidLocal();
    this.turnoService.consultarEmpleados(uid)
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded) {
          this.lsEmpleado = resp.data;
        }
        this.loadingComboCola = false;
      }, () => { this.loadingComboCola = false; });
  }

  onSelectionColab(colaborador: any) {
    this.colSelected = colaborador;
    this.empleado = colaborador;
    this.ConsultarDiasJustificarN();
    //console.log(this.diasJustificar);
  }

  checkYo() {
    this.LimpiarFormJustificacion();
    this.flagBeneficiario = true;
    this.ctrlColaborador.setValue(
      this.cliente.apellidos + ' ' + this.cliente.nombres
    );
    if (this.cliente) {
      this.ConsultarDiasJustificarN();
    }
  }

  checkOtro() {
    this.LimpiarFormJustificacion();
    this.flagBeneficiario = false;
    this.ctrlColaborador.setValue('');
    this.lstDiasJustificar = of([]);
    if (this.empleado) {
      this.ctrlColaborador.setValue(
        this.empleado.apellidos + ' ' + this.empleado.nombres
      );
      //this.ConsultarDiasJustificarN();
    }
  }

  LimpiarFormJustificacion() {
    this.selectedIdMarcacion = '';
    this.selectedIdTipoJustificacion = '';
    this.comentario.setValue('');
    this.files = [];
  }

  async SunmitSolicitudJustificacion() {
    if (this.flagBeneficiario) {
      if (
        this.selectedIdMarcacion !== undefined &&
        this.selectedIdTipoJustificacion !== undefined
      ) {
        const diaJustificar = this.diasJustificar.find(x => x.marcacionId === this.selectedIdMarcacion);

        if (this.tieneJustificacionSolicitada(diaJustificar!)) {
          this.toaster.warning('Ya existe una solicitud en proceso para esa novedad');
          return
        }

        const adjuntos = (await this.uploadFiles(this.files)) || [];

        const justificacion: SolicitudJustificacionRequest = {
          codOrganizacion: 1,
          idTipoJustificacion: this.selectedIdTipoJustificacion,
          idMarcacionG: this.selectedIdMarcacion,
          idMarcacion: 'F2F0F072-9C01-44AB-AE87-09D237DFE24E',
          idFeature: idFeatureJustificacion,
          tipoMarcacion: '',
          estadoMarcacion: '',
          identBeneficiario: this.cliente.identificacion,
          identificacionEmpleado: this.cliente.identificacion,
          nombreEmpleado: `${this.cliente.apellidos} ${this.cliente.nombres}`,
          fecha: `${this.diasJustificar.find(
            (x) => x.marcacionId === this.selectedIdMarcacion
          )?.fechaMarcacion
            }`,
          comentarios: this.comentario.value || '',
          docAdjunto: adjuntos,
        };
        // console.log(justificacion);

        Swal.fire({
          title: '¿ Confirmar acción ?',
          showCancelButton: true,
          confirmButtonText: 'Sí',
          cancelButtonText: 'No',
          width: 300,
        }).then((result: any) => {
          if (result.isConfirmed)
            this.CrearSolicitudJustificacion(justificacion);
        });
      } else this.formJustificacionTocuched = true;
    } else {
      if (
        this.selectedIdMarcacion !== undefined &&
        this.selectedIdTipoJustificacion !== undefined
      ) {
        const diaJustificar = this.diasJustificar.find(x => x.marcacionId === this.selectedIdMarcacion);

        if (this.tieneJustificacionSolicitada(diaJustificar!)) {
          this.toaster.warning('Ya existe una solicitud en proceso para esa novedad');
          return
        }

        const adjuntos = (await this.uploadFiles(this.files)) || [];

        const justificacion: SolicitudJustificacionRequest = {
          codOrganizacion: 1,
          idTipoJustificacion: this.selectedIdTipoJustificacion,
          idMarcacionG: this.selectedIdMarcacion,
          idMarcacion: 'F2F0F072-9C01-44AB-AE87-09D237DFE24E',
          idFeature: idFeatureJustificacion,
          tipoMarcacion: '',
          estadoMarcacion: '',
          identBeneficiario: this.empleado.identificacion,
          identificacionEmpleado: this.cliente.identificacion,
          nombreEmpleado: `${this.cliente.apellidos} ${this.cliente.nombres}`,
          fecha: `${this.diasJustificar.find(
            (x) => x.marcacionId === this.selectedIdMarcacion
          )?.fechaMarcacion
            }`,
          comentarios: this.comentario.value || '',
          docAdjunto: adjuntos,
        };
        // console.log(justificacion);

        Swal.fire({
          title: '¿ Confirmar acción ?',
          showCancelButton: true,
          confirmButtonText: 'Sí',
          cancelButtonText: 'No',
          width: 300,
        }).then((result: any) => {
          if (result.isConfirmed)
            this.CrearSolicitudJustificacion(justificacion);
        });
      } else this.formJustificacionTocuched = true;
    }
  }

  onSelect(event: any) {
    var filesize = 0;

    if (event.addedFiles.length > 0) {
      event.addedFiles.forEach((value: any) => {
        if (value.type == 'application/pdf' || value.type == 'image/png' || value.type == 'image/jpeg' || value.type == 'image/jpg') {
          this.files.forEach((value: any) => {
            filesize = filesize + value.size;
          });
          if (filesize + value.size > 10485760) {
            this.toaster.error('Se alcanzó el límite de 10mb');
          } else {
            this.files.push(...event.addedFiles);
          }
        } else {
          this.toaster.error('Archivo no admitido');
        }
      });
    } else if (event.rejectedFiles.length > 0) {
      this.toaster.error('Archivo no admitido');
    }
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  async convertBase64(file: File) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);

      fileReader.onload = () => {
        // resolve(fileReader.result);
        resolve(fileReader.result?.toString().replace(/^data:(.*,)?/, ''));
      };

      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  }

  async uploadFiles(files: File[]) {
    let adjuntoRequest: AdjuntoRequest[] = [];
    files.forEach(async (file) => {
      const base64 = await this.convertBase64(file);
      adjuntoRequest.push({
        archivoBase64: base64,
        nombreArchivo: file.name,
        extensionArchivo: file.name.split('.').pop() || '',
      });
    });

    return adjuntoRequest;
  }

  onSelectionDiasJustificar(diaJustificar: DiasJustificar) {
    if (this.tieneJustificacionSolicitada(diaJustificar))
      this.toaster.warning('Ya existe una solicitud en proceso para esa novedad');
  }

  tieneJustificacionSolicitada(diasJustificar: DiasJustificar): boolean {
    if (diasJustificar)
      if (diasJustificar.idSolicitud) {
        if (diasJustificar.estadoSolicitud === this.serviceSolicitud.estadoSolicitado)
          return true
      }

    return false
  }

}
