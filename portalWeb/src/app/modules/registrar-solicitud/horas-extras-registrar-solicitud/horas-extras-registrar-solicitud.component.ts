import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { format } from 'date-fns';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { GestionService } from 'src/app/helper/gestion.service';
import { TokenService } from 'src/app/helper/token.service';
import { Empleado } from 'src/app/models/cliente/empleado.interface';
import { ResponseModel } from 'src/app/models/response.model';
import { SolicitudHorasExtrasRequest } from 'src/app/models/solicitud/solicitud-horasextras';
import { ProspectoService } from 'src/app/services/prospecto.service';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { TurnosService } from 'src/app/services/turnos.service';
import Swal from 'sweetalert2';

const timeIni = { hour: 0, minute: 0 };
const timeFin = { hour: 0, minute: 0 };

@Component({
  selector: 'app-horas-extras-registrar-solicitud',
  templateUrl: './horas-extras-registrar-solicitud.component.html',
  styleUrls: ['./horas-extras-registrar-solicitud.component.scss']
})
export class HorasExtrasRegistrarSolicitudComponent implements OnInit {
  @Input() empleado!: Empleado;

  tabActive: string = 'horasExtras';

  comentario = new FormControl('', Validators.maxLength(300));

  formPermisoTocuched: boolean = false;


  minDatePermiso: NgbDateStruct;

  fechaPermisoHora!: NgbDateStruct;
  fechaPermisoHora2!: NgbDateStruct;
  horaIni = timeIni;
  horaFin = timeFin;

  cliente!: Empleado;
  //beneficiario!: Empleado;
  solicitudHorasExtrasRequest!: SolicitudHorasExtrasRequest;

  ctrlColaborador = new FormControl('');
  filteredColaborador!: Observable<Empleado[]>;
  lsEmpleado: Empleado[] = [];
  codTipSolGen: string = '1';

  flagBeneficiario: boolean = true;
  loadingComboCola: boolean = false;

  constructor(private serviceProspecto: ProspectoService, private turnoService: TurnosService, private tokenService: TokenService, private gestionService: GestionService, private serviceSolicitud: SolicitudService,
    private spinner: NgxSpinnerService, private toaster: ToastrService) {
    const date = new Date();
    this.minDatePermiso = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }

  ngOnInit(): void {
    this.cliente = this.empleado;
    this.ctrlColaborador.setValue(this.empleado?.apellidos + ' ' + this.empleado?.nombres);
    this.obtenerEmpleados();
  }

  obtenerEmpleados() {
    this.loadingComboCola = true;
    var uid = this.gestionService.obtenerSuscriptorUidLocal();
    this.turnoService.consultarEmpleados(uid)
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded) {
          this.lsEmpleado = resp.data;
        }
        //this.filteredColaborador = this.ctrlColaborador.valueChanges.pipe(startWith(''), map(value => this._filterColab(value || '')));
        this.loadingComboCola = false;
      }, () => { this.loadingComboCola = false; });
  }
  private _filterColab(value: string): Empleado[] {
    const filterValue = value.toLowerCase();
    return this.lsEmpleado.filter(option => option.apellidos.toLowerCase().includes(filterValue));
  }

  SunmitSolicitudPermiso() {
    const cli = this.cliente;
    const emp = this.empleado;
    if (this.fechaPermisoHora !== undefined && this.fechaPermisoHora !== undefined && this.horaIni !== null && this.horaFin !== null) {
      const fdn = new Date(this.fechaPermisoHora.year, this.fechaPermisoHora.month - 1, this.fechaPermisoHora.day, this.horaIni.hour, this.horaIni.minute);
      const fhn = new Date(this.fechaPermisoHora2.year, this.fechaPermisoHora2.month - 1, this.fechaPermisoHora2.day, this.horaFin.hour, this.horaFin.minute);

      if (fhn < fdn) {
        this.toaster.warning('"hora inicial" no puede ser mayor que la "hora final"');
        return;
      }
      var extra: SolicitudHorasExtrasRequest
      if (this.flagBeneficiario == true) {
        extra = {
          identSolicitante: cli.identificacion,
          identBeneficiario: cli.identificacion,
          fechaDesde: format(this.ngbDateTime(this.fechaPermisoHora, { hour: 0, minute: 0 }), 'yyyy-MM-dd\'T\'HH:mm:ss'),
          fechaHasta: format(this.ngbDateTime(this.fechaPermisoHora2, { hour: 0, minute: 0 }), 'yyyy-MM-dd\'T\'HH:mm:ss'),
          horaInicio: format(this.ngbDateTime(this.fechaPermisoHora, this.horaIni), 'HH:mm'),
          horaFin: format(this.ngbDateTime(this.fechaPermisoHora, this.horaFin), 'HH:mm'),
          comentarios: this.comentario.value || '',
        }
      }
      else {
        extra = {
          identSolicitante: cli.identificacion,
          identBeneficiario: emp.identificacion,
          fechaDesde: format(this.ngbDateTime(this.fechaPermisoHora, { hour: 0, minute: 0 }), 'yyyy-MM-dd\'T\'HH:mm:ss'),
          fechaHasta: format(this.ngbDateTime(this.fechaPermisoHora2, { hour: 0, minute: 0 }), 'yyyy-MM-dd\'T\'HH:mm:ss'),
          horaInicio: format(this.ngbDateTime(this.fechaPermisoHora, this.horaIni), 'HH:mm'),
          horaFin: format(this.ngbDateTime(this.fechaPermisoHora, this.horaFin), 'HH:mm'),
          comentarios: this.comentario.value || '',
        }
      }


        Swal.fire({
          title: '¿ Confirmar acción ?',
          showCancelButton: true,
          confirmButtonText: 'Sí',
          cancelButtonText: 'No',
          width: 300
        }).then((result: any) => {
          if (result.isConfirmed)
            this.CrearSolicitudHorasExtras(extra);

        });
    }
  }
  CrearSolicitudHorasExtras(extras: SolicitudHorasExtrasRequest) {
    this.spinner.show();
    this.serviceSolicitud.CrearSolicitudHorasExtras(extras)
      .subscribe((resp: ResponseModel) => {

        if (resp.succeeded && resp.statusCode === '100') {
          this.LimpiarFormPermiso();
          this.toaster.success(resp.message, 'Información');
        } else {
          this.toaster.warning(resp.message, 'Información');
        }
        this.spinner.hide();
      }, () => {
        this.toaster.error('No se pudo establecer la conexión');
        this.spinner.hide()
      });
  }

  checkYo() {
    this.flagBeneficiario = true;
    this.ctrlColaborador.setValue(this.cliente.apellidos + ' ' + this.cliente.nombres);
  }
  checkOtro() {
    this.flagBeneficiario = false;
    this.ctrlColaborador.setValue('');
  }
  onSelectionColab(colaborador: any) {

    this.empleado = colaborador;
    //this.idJefe=option.id

  }
  changeTipoHoraDia() {
    this.LimpiarFormPermiso();
  }

  LimpiarFormPermiso() {
    this.comentario.setValue('');
    this.fechaPermisoHora = {} as NgbDateStruct;
    this.horaIni = timeIni;
    this.horaFin = timeFin;
  }
  ngbDateTime(date: NgbDateStruct, time: { hour: number, minute: number }): Date {
    return new Date(date.year, date.month - 1, date.day, time.hour, time.minute, 0);
  }

}
