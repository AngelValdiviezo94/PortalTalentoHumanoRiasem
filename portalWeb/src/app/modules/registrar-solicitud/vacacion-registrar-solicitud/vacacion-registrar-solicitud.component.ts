import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NgbCalendar, NgbDate, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { GestionService } from 'src/app/helper/gestion.service';
import { TokenService } from 'src/app/helper/token.service';
import { Empleado } from 'src/app/models/cliente/empleado.interface';
import { ResponseModel } from 'src/app/models/response.model';
import { SolicitudVacacionRequest } from 'src/app/models/solicitud/solicitud-vacacion.interface';
import { AsignacionTurnoResponse } from 'src/app/models/turnos/asignacion-turno';
import { SolicitudService } from 'src/app/services/solicitud.service';
import { TurnosService } from 'src/app/services/turnos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vacacion-registrar-solicitud',
  templateUrl: './vacacion-registrar-solicitud.component.html',
  styleUrls: ['./vacacion-registrar-solicitud.component.scss']
})
export class VacacionRegistrarSolicitudComponent implements OnInit {
  @Input() empleado!: Empleado;

  hoveredDate: NgbDate | null = null;
  fromDate!: NgbDate | null;
  toDate!: NgbDate | null;

  formVacacionTocuched: boolean = false;

  comentario = new FormControl('', Validators.maxLength(300));
  lstEmpleadoReemplazo!: Observable<any[]>;
  selectedReemplazoId!: string;

  colaboradores: any = [];
  periodoColaborador: any = [];
  codTipSolGen: string = '1';
  ctrlColaborador = new FormControl('');
  colSelected: any = undefined;
  turnosColaborador: AsignacionTurnoResponse[] = [];

  fechaRetorno!: Date | undefined;
  tieneSolicitudPendiente: boolean = false;
  loadingComboCola: boolean = false;

  constructor(private calendar: NgbCalendar, public formatter: NgbDateParserFormatter, private serviceSolicitud: SolicitudService,
    private tokenService: TokenService, private turnoservice: TurnosService, private gestionService: GestionService,
    private spinner: NgxSpinnerService, private toaster: ToastrService) {
  }

  ngOnInit(): void {
    this.ctrlColaborador.setValue(this.empleado?.apellidos + ' ' + this.empleado?.nombres);
    this.consultarEmpleados(this.gestionService.obtenerSuscriptorUidLocal());
    this.ConsultarPeriodoVacacion(this.tokenService.getIdentificacion());
  }

  ConsultarEmpleadoReemplazo(identificacion: string) {
    this.serviceSolicitud.ConsultarEmpleadoReemplazo(identificacion)
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded)
          this.lstEmpleadoReemplazo = of(resp.data);
      });
  }

  consultarEmpleados(uidPadre: string) {
    this.loadingComboCola = true;
    this.turnoservice.consultarEmpleados(uidPadre)
      .subscribe(resp => {
        if (resp.succeeded) {
          this.colaboradores = resp.data;
        }
        this.loadingComboCola = false;
      }, () => { this.loadingComboCola = false; })
  }

  ConsultarPeriodoVacacion(identificacion: string) {
    this.serviceSolicitud.ConsultarPeriodoVacacion(identificacion)
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded) {
          this.periodoColaborador = resp.data;
        }
      });
  }

  CrearSolicitudVacacion(vacacion: SolicitudVacacionRequest) {
    this.spinner.show();

    this.serviceSolicitud.CrearSolicitudVacacion(vacacion)
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded && resp.statusCode === '100') {
          this.LimpiarFormVacacion();
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

  changecodTipSolGen(valor: any) {
    this.periodoColaborador = [];

    if (valor === '1')
      this.ConsultarEmpleadoReemplazo(this.tokenService.getIdentificacion());
  }

  LimpiarFormVacacion() {
    this.colSelected = undefined;
    this.selectedReemplazoId = '';
    this.fromDate = null;
    this.toDate = null;
    this.comentario.setValue('');
    this.codTipSolGen = '1';
    this.fechaRetorno = undefined;
    this.ctrlColaborador.setValue(this.empleado?.apellidos + ' ' + this.empleado?.nombres);
  }

  changeColaborador(colaborador: any) {
    this.colSelected = colaborador;

    if (colaborador !== undefined) {
      this.ExisteSolicitudVacacionPendiente(colaborador.identificacion);
      this.ConsultarPeriodoVacacion(colaborador.identificacion);
      this.ConsultarEmpleadoReemplazo(colaborador.identificacion);
    }
  }

  ConsultarTurnosColaboradorByIdPadre(identificacion: string, hasta: NgbDate) {
    let fd = new Date(hasta.year as number, hasta.month - 1, hasta.day);
    let fh = new Date(hasta.year as number, hasta.month - 1, hasta.day);

    fd.setDate(fd.getDate() + 1);
    fh.setDate(fh.getDate() + 6);

    this.serviceSolicitud.ConsultarTurnosColaborador(identificacion, format(fd, 'yyyy-MM-dd'), format(fh, 'yyyy-MM-dd'))
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded) {
          this.turnosColaborador = resp.data;
          let turnos = this.turnosColaborador.filter(x => x.identificacion === this.colSelected.identificacion);
          turnos = turnos.sort((a, b) => (a.fechaAsignacion < b.fechaAsignacion) ? -1 : 1)

          let proTurno = turnos.find(x => x.codigoTurno !== 'L-00' && x.codigoTurno !== 'F-00');
          this.fechaRetorno = proTurno !== undefined ? proTurno.fechaAsignacion : undefined;
        }
      });
  }

  ExisteSolicitudVacacionPendiente(identificacion: string) {
    this.serviceSolicitud.ExisteSolicitudVacacionPendiente(identificacion)
      .subscribe((resp: ResponseModel) => {
        if (resp.succeeded) {
          this.tieneSolicitudPendiente = resp.data != null ? true : false;
        }
      });
  }

  DevuelveFechaVacacion(date: NgbDate | null) {
    if (date !== null && date != undefined) {
      const fecha = new Date(date.year as number, date.month - 1, date.day);

      const nombreDia = format(fecha, 'EEEE', { locale: es });
      const nombreMes = format(fecha, 'LLLL', { locale: es });
      const dia = fecha.getDate();
      const anio = fecha.getFullYear();

      return `${nombreDia} ${dia} de ${nombreMes} de ${anio}`;
    }

    return ''
  }

  DevuelveFechaVacacionDate(date: Date) {
    if (date !== null && date !== undefined) {
      const fecha = new Date(date);

      const nombreDia = format(fecha, 'EEEE', { locale: es });
      const nombreMes = format(fecha, 'LLLL', { locale: es });
      const dia = fecha.getDate();
      const anio = fecha.getFullYear();

      return `${nombreDia} ${dia} de ${nombreMes} de ${anio}`;
    }

    return ''
  }

  changeToDate() {
    if (this.toDate !== null && this.toDate !== undefined)
      this.ConsultarTurnosColaboradorByIdPadre(this.tokenService.getIdentificacion(), this.toDate as NgbDate);
  }

  SubmitSolicitudVacacion() {
    if (this.colSelected !== undefined && this.selectedReemplazoId !== undefined && this.fromDate !== undefined && this.toDate !== undefined) {
      const fd = new Date(this.fromDate?.year as number, this.fromDate?.month as number - 1, this.fromDate?.day);
      const fh = new Date(this.toDate?.year as number, this.toDate?.month as number - 1, this.toDate?.day);

      if (fd > fh) {
        this.toaster.warning('Fecha inicial no puede ser mayor que la fecha final');
        return;
      }

      const dias = differenceInDays(fh, fd) + 1;

      if (dias < 7) {
        this.toaster.warning('Debes elegir al menos 7 días de vacaciones');
        return;
      }

      const vacacion: SolicitudVacacionRequest = {
        codOrganizacion: 1,
        nombreEmpleado: this.empleado.nombres,
        identificacionEmpleado: this.empleado.identificacion,
        idSolicitante: this.empleado.codigoEmpleado,
        idBeneficiario: Number(this.colSelected.codigoConvivencia),
        fechaDesde: format(fd, 'yyyy-MM-dd'),
        fechaHasta: format(fh, 'yyyy-MM-dd'),
        periodoAfectacion: [],
        codigoEmpleadoReemplazo: this.selectedReemplazoId.toString(),
        contenidoTexto: '',
        contenidoHtml: '',
        observacion: this.comentario.value || ''
      };

      Swal.fire({
        title: '¿ Confirmar acción ?',
        showCancelButton: true,
        confirmButtonText: 'Sí',
        cancelButtonText: 'No',
        width: 300
      }).then((result: any) => {
        if (result.isConfirmed)
          this.CrearSolicitudVacacion(vacacion);
      });
    }

    this.formVacacionTocuched = true;
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
      this.ConsultarTurnosColaboradorByIdPadre(this.tokenService.getIdentificacion(), this.toDate);
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  isHovered(date: NgbDate) {
    return (
      this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate)
    );
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return (
      date.equals(this.fromDate) ||
      (this.toDate && date.equals(this.toDate)) ||
      this.isInside(date) ||
      this.isHovered(date)
    );
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

}