import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { format } from 'date-fns';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { map, Observable, of, startWith } from 'rxjs';
import { TokenService } from 'src/app/helper/token.service';
import { GestionService } from 'src/app/helper/gestion.service';
import { Empleado } from 'src/app/models/cliente/empleado.interface';
import { ResponseModel } from 'src/app/models/response.model';
import { SolicitudPermisoRequest } from 'src/app/models/solicitud/solicitud-permiso.interface';
import { ProspectoService } from 'src/app/services/prospecto.service';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { TurnosService } from 'src/app/services/turnos.service';
import Swal from 'sweetalert2';
import { FeatureService } from 'src/app/helper/feature.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

const timeIni = { hour: 0, minute: 0 };
const timeFin = { hour: 0, minute: 0 };

@Component({
  selector: 'app-registrar-solicitud',
  templateUrl: './registrar-solicitud.component.html',
  styleUrls: ['./registrar-solicitud.component.scss']
})
export class RegistrarSolicitudComponent implements OnInit {
  isFeatureRegistrarPermiso!: boolean;
  isFeatureRegistrarJustificacion!: boolean;
  isFeatureRegistrarVacacion!: boolean;
  isFeatureRegistrarHorasExtras: boolean;

  tabActive: string = 'permiso';
  lstMotivo!: Observable<any[]>;
  selectedMotivoId: any;
  comentario = new FormControl('', Validators.maxLength(300));

  formPermisoTocuched: boolean = false;

  numeroPermisoHoraDia: string = "1";

  minDatePermiso: NgbDateStruct;

  fechaPermisoHora!: NgbDateStruct;
  horaIni = timeIni;
  horaFin = timeFin;

  fechaPermisoDesde!: NgbDateStruct;
  horaDesde = timeIni;
  fechaPermisoHasta!: NgbDateStruct;
  horaHasta = timeFin;

  cliente!: Empleado;
  empleado!: Empleado;
  solicitudPermisoRequest!: SolicitudPermisoRequest;

  ctrlColaborador = new FormControl('');
  filteredColaborador!: Observable<Empleado[]>;
  lsEmpleado: Empleado[] = [];
  codTipSolGen: string = '1';

  flagBeneficiario: boolean = true;
  loadingComboCola: boolean = false;

  constructor(private serviceProspecto: ProspectoService, private turnoService: TurnosService, private tokenService: TokenService, private gestionService: GestionService, private serviceSolicitud: SolicitudService,
    private spinner: NgxSpinnerService, private toaster: ToastrService, private featureService: FeatureService, private router: Router) {
    const date = new Date();
    this.minDatePermiso = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };

    this.isFeatureRegistrarPermiso = this.featureService.isFeatureActive(environment.codFeaRegistrarSolicitudPermiso);
    this.isFeatureRegistrarJustificacion = this.featureService.isFeatureActive(environment.codFeaRegistrarSolicitudJustificacion);
    this.isFeatureRegistrarVacacion = this.featureService.isFeatureActive(environment.codFeaRegistrarSolicitudVacacion);
    this.isFeatureRegistrarHorasExtras = this.featureService.isFeatureActive(environment.codFeaRegistrarSolicitudHorasExtras);
  }

  ngOnInit(): void {
    if (!this.isFeatureRegistrarPermiso && !this.isFeatureRegistrarJustificacion && !this.isFeatureRegistrarVacacion)
      this.router.navigate(['/home']);

    this.obtenerCliente();
    this.ConsultarTipoPermiso();
    this.obtenerEmpleados();
  }

  obtenerCliente() {
    this.serviceProspecto.obtenerCliente(this.tokenService.getIdentificacion())
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded)
          this.cliente = resp.data;
        this.ctrlColaborador.setValue(this.cliente.apellidos + ' ' + this.cliente.nombres);
      });
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

  ConsultarTipoPermiso() {
    this.serviceSolicitud.ConsultarTipoPermiso()
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded) {
          this.lstMotivo = of(resp.data);
        }
      });
  }

  onSelectionColab(colaborador: any) {

    this.empleado = colaborador;
    //this.idJefe=option.id

  }

  checkYo() {
    this.flagBeneficiario = true;
    this.ctrlColaborador.setValue(this.cliente.apellidos + ' ' + this.cliente.nombres);
  }
  checkOtro() {
    this.flagBeneficiario = false;
    this.ctrlColaborador.setValue('');
  }

  SunmitSolicitudPermiso() {
    const cli = this.cliente;
    const emp = this.empleado;

    //Permiso por hora
    if (this.numeroPermisoHoraDia === '1') {
      if (this.selectedMotivoId !== undefined && this.fechaPermisoHora !== undefined && this.horaIni !== null && this.horaFin !== null) {
        const fdn = new Date(this.fechaPermisoHora.year, this.fechaPermisoHora.month - 1, this.fechaPermisoHora.day, this.horaIni.hour, this.horaIni.minute);
        const fhn = new Date(this.fechaPermisoHora.year, this.fechaPermisoHora.month - 1, this.fechaPermisoHora.day, this.horaFin.hour, this.horaFin.minute);

        if (fhn < fdn) {
          this.toaster.warning('"hora inicial" no puede ser mayor que la "hora final"');
          return;
        }
        var permiso: SolicitudPermisoRequest
        if (this.flagBeneficiario == true) {
          permiso = {
            codOrganizacion: 1,
            idTipoPermiso: this.selectedMotivoId,
            idSolicitante: cli.codigoEmpleado,
            nombreEmpleado: `${cli.apellidos} ${cli.nombres}`,
            idBeneficiario: cli.codigoEmpleado,
            identificacion: cli.identificacion,
            porHoras: true,
            fechaDesde: format(this.ngbDateTime(this.fechaPermisoHora, this.horaIni), 'yyyy-MM-dd\'T\'HH:mm:ss'),
            horaInicio: format(this.ngbDateTime(this.fechaPermisoHora, this.horaIni), 'HH:mm'),
            fechaHasta: format(this.ngbDateTime(this.fechaPermisoHora, this.horaFin), 'yyyy-MM-dd\'T\'HH:mm:ss'),
            horaFin: format(this.ngbDateTime(this.fechaPermisoHora, this.horaFin), 'HH:mm'),
            observacion: this.comentario.value || '',
            contenidoHtml: '',
            contenidoTexto: ''
          }
        } else {
          permiso = {
            codOrganizacion: 1,
            idTipoPermiso: this.selectedMotivoId,
            idSolicitante: cli.codigoEmpleado,
            nombreEmpleado: `${cli.apellidos} ${cli.nombres}`,
            idBeneficiario: emp.codigoConvivencia,
            identificacion: cli.identificacion,
            porHoras: true,
            fechaDesde: format(this.ngbDateTime(this.fechaPermisoHora, this.horaIni), 'yyyy-MM-dd\'T\'HH:mm:ss'),
            horaInicio: format(this.ngbDateTime(this.fechaPermisoHora, this.horaIni), 'HH:mm'),
            fechaHasta: format(this.ngbDateTime(this.fechaPermisoHora, this.horaFin), 'yyyy-MM-dd\'T\'HH:mm:ss'),
            horaFin: format(this.ngbDateTime(this.fechaPermisoHora, this.horaFin), 'HH:mm'),
            observacion: this.comentario.value || '',
            contenidoHtml: '',
            contenidoTexto: ''
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
            this.CrearSolicitudPermiso(permiso);
        });
      } else
        this.formPermisoTocuched = true;
    }

    //Permiso por día
    if (this.numeroPermisoHoraDia === '2') {
      if (this.selectedMotivoId !== undefined && this.fechaPermisoDesde !== undefined && this.fechaPermisoHasta !== undefined) {
        const fdn = new Date(this.fechaPermisoDesde.year, this.fechaPermisoDesde.month - 1, this.fechaPermisoDesde.day, 0, 0, 0);
        const fhn = new Date(this.fechaPermisoHasta.year, this.fechaPermisoHasta.month - 1, this.fechaPermisoHasta.day, 23, 59, 59);

        if (fhn < fdn) {
          this.toaster.warning('"fecha desde" no puede ser mayor que la "fecha hasta"');
          return;
        }
        if (this.flagBeneficiario == true) {
          permiso = {
            codOrganizacion: 1,
            idTipoPermiso: this.selectedMotivoId,
            idSolicitante: cli.codigoEmpleado,
            nombreEmpleado: `${cli.apellidos} ${cli.nombres}`,
            idBeneficiario: cli.codigoEmpleado,
            identificacion: cli.identificacion,
            porHoras: false,
            fechaDesde: format(this.ngbDateTimePorDia(this.fechaPermisoDesde, 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
            horaInicio: format(this.ngbDateTimePorDia(this.fechaPermisoDesde, 1), 'HH:mm'),
            fechaHasta: format(this.ngbDateTimePorDia(this.fechaPermisoHasta, 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
            horaFin: format(this.ngbDateTimePorDia(this.fechaPermisoHasta, 2), 'HH:mm'),
            observacion: this.comentario.value || '',
            contenidoHtml: '',
            contenidoTexto: ''
          }
        }
        else {
          permiso = {
            codOrganizacion: 1,
            idTipoPermiso: this.selectedMotivoId,
            idSolicitante: cli.codigoEmpleado,
            nombreEmpleado: `${cli.apellidos} ${cli.nombres}`,
            idBeneficiario: emp.codigoConvivencia,
            identificacion: cli.identificacion,
            porHoras: false,
            fechaDesde: format(this.ngbDateTimePorDia(this.fechaPermisoDesde, 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
            horaInicio: format(this.ngbDateTimePorDia(this.fechaPermisoDesde, 1), 'HH:mm'),
            fechaHasta: format(this.ngbDateTimePorDia(this.fechaPermisoHasta, 2), 'yyyy-MM-dd\'T\'HH:mm:ss'),
            horaFin: format(this.ngbDateTimePorDia(this.fechaPermisoHasta, 2), 'HH:mm'),
            observacion: this.comentario.value || '',
            contenidoHtml: '',
            contenidoTexto: ''
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
            this.CrearSolicitudPermiso(permiso);
        });
      } else
        this.formPermisoTocuched = true;
    }

  }

  ngbDateTime(date: NgbDateStruct, time: { hour: number, minute: number }): Date {
    return new Date(date.year, date.month - 1, date.day, time.hour, time.minute, 0);
  }

  ngbDateTimePorDia(date: NgbDateStruct, tipo: number): Date {
    if (tipo === 1)
      return new Date(date.year, date.month - 1, date.day, 0, 0, 0);
    else
      return new Date(date.year, date.month - 1, date.day, 23, 59, 59);
  }


  CrearSolicitudPermiso(permiso: SolicitudPermisoRequest) {
    this.spinner.show();
    // console.log(permiso);
    this.serviceSolicitud.CrearSolicitudPermiso(permiso)
      .subscribe((resp: ResponseModel) => {
        // console.log(resp);
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

  changeTipoHoraDia() {
    this.LimpiarFormPermiso();
  }

  LimpiarFormPermiso() {
    this.selectedMotivoId = undefined;
    this.comentario.setValue('');
    this.fechaPermisoHora = {} as NgbDateStruct;
    this.horaIni = timeIni;
    this.horaFin = timeFin;
    this.fechaPermisoDesde = {} as NgbDateStruct;
    this.horaDesde = timeIni;
    this.fechaPermisoHasta = {} as NgbDateStruct;
    this.horaHasta = timeFin;
  }

  changeTabEvent() {
    if (this.tabActive === 'permiso') {
      this.LimpiarFormPermiso();
    }
  }

}
