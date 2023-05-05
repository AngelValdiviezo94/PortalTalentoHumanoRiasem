import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView, CalendarDateFormatter, DAYS_OF_WEEK } from 'angular-calendar';
import { startOfDay, endOfDay, subDays, addDays, endOfMonth, isSameDay, isSameMonth, addHours, format, startOfMonth, endOfYear, startOfWeek, endOfWeek, } from 'date-fns';
import { Subject } from 'rxjs';
import { NgbCalendar, NgbDate, NgbDateParserFormatter, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TurnosService } from 'src/app/services/turnos.service';
import { AsignaTurnoRequest, ColaboradorSubturno, SubTurnosCalendar, ClienteSubturno, SubturnoAsignado, TurnoCalendar } from 'src/app/models/turnos/turno-calendar.model';
import { Cliente } from 'src/app/models/cliente/cliente.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FeatureService } from 'src/app/helper/feature.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { TipoJornadaType, TurnoType } from 'src/app/models/turnos/turno.model';
import { FechaService } from 'src/app/helper/fecha.service';
import { GestionService } from 'src/app/helper/gestion.service';
import { ResponseModel } from 'src/app/models/response.model';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from 'src/app/helper/token.service';
import { AsignadoColaboradorInterface, AsignadoSubturnoInterface } from 'src/app/models/turnos/asignacion-turno';
import Swal from 'sweetalert2';
import { MarcacionColaborador } from 'src/app/models/marcaciones/marcacion-recursos';
import { MatDialog } from '@angular/material/dialog';
import { MarcacionService } from 'src/app/services/marcacion.service';
import { GenerarArchivoTurnosAsignadosComponent } from './generar-archivo-turnos-asignados/generar-archivo-turnos-asignados.component';
import { ColaboradorTurnoMarcacionComponent } from './colaborador-turno-marcacion/colaborador-turno-marcacion.component';
import { NgxSpinnerService } from 'ngx-spinner';

const feaCodTurno = environment.codFeaTurno;
const atriCodConsultar = 'CON';
const atriCodGenerar = 'GEN';
const atriCodAsignar = 'ASG';
const atriCodGenerarExcel = 'RPT';
const atriCodCargarExcel = 'CAR';

const colors: any = {
  red: {
    primary: '#000000',
    secondary: '#FFFFFF',
  },
  blue: {
    primary: '#000000',
    secondary: '#A7C2F5',
  },
};

@Component({
  selector: 'app-turnos',
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.scss'],
})
export class TurnosComponent implements OnInit {
  @ViewChild('modalContent', { static: true }) modalContent!: TemplateRef<any>;
  @ViewChild('modalVerAsignado', { static: true }) modalVerAsignado!: TemplateRef<any>;
  @ViewChild('modalEditarAsignacion', { static: true }) modalEditarAsignacion!: TemplateRef<any>;

  isFeatureActive: boolean;
  isAtrConsultarActive: boolean;
  isAtrGenerarActive: boolean;
  isAtrAsignarActive: boolean;
  isAtrGenerarExcelActive: boolean;
  isAtrCargarExcelActive: boolean;

  CalendarView = CalendarView;
  actions: CalendarEventAction[];
  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  refresh: Subject<any> = new Subject();
  activeDayIsOpen: boolean = false;
  newEvent!: CalendarEvent;
  weekStartsOn: number = DAYS_OF_WEEK.MONDAY;

  locale: string = 'es';

  formAsignaTurno!: FormGroup;
  formEditarAsignacionTurno!: FormGroup;

  lstTipoJornadaType: TipoJornadaType[] = [];
  events: TurnoCalendar[] = [];
  filtroTurno: string = '';
  ctrlFiltroTurno = new FormControl('');

  lstAsignacion: CalendarEvent[] = [];
  lstColaboradorTurno: AsignadoColaboradorInterface[] = [];
  lstColaTurnoSelected: AsignadoColaboradorInterface[] = [];
  turnoAsignadoSelected!: CalendarEvent;

  colaborador: Cliente[] = [];
  selectedColaborador: Cliente[] = [];

  modalData!: any | {
    action: string;
    event: CalendarEvent;
  };

  showModalCrear: boolean = false;
  showModalColaborador: boolean = false;
  showModalArchivoTurnosAsignados: boolean = false;

  turnoSelected!: TurnoType;
  turnoSelectedChilds: SubTurnosCalendar[] = [];

  turnoSelectedEdit!: TurnoType;
  turnoSelectedChildsEdit: SubTurnosCalendar[] = [];

  model!: NgbDateStruct;
  today = this.calendar.getToday();

  hoveredDate: NgbDate | null = null;
  fdIni: NgbDate | null;
  fhIni: NgbDate | null;
  fromDate!: NgbDate | null;
  toDate!: NgbDate | null;

  tmpColaSubturno: any[] = [];
  colaboradorSubturno: ColaboradorSubturno[] = [];
  colaSinSubturno: string[] = [];
  procesando: boolean = false;
  asignaTurno!: AsignaTurnoRequest;

  colaboradorSubturnoEdit: ColaboradorSubturno[] = [];
  asignaTurnoEditar: AsignadoColaboradorInterface[] = [];

  fechaIniConsulta!: string;
  fechaFinConsulta!: string;

  tabActive: string = '';
  lstMarcacionColaborador: MarcacionColaborador[] = [];
  fechaIniSemana: string;
  fechaFinSemana: string;

  dataExcelObject!: any[];

  constructor(private modal: NgbModal, public turnoservice: TurnosService, private fb: FormBuilder, private tokenService: TokenService,
    private featureService: FeatureService, private router: Router, private fs: FechaService, private toaster: ToastrService,
    private calendar: NgbCalendar, public formatter: NgbDateParserFormatter, private gestionService: GestionService,
    private marcacionService: MarcacionService, public dialog: MatDialog, private spinner: NgxSpinnerService) {
    this.isFeatureActive = this.featureService.isFeatureActive(feaCodTurno);
    this.isAtrConsultarActive = this.featureService.isAtributoActive(feaCodTurno, atriCodConsultar);
    this.isAtrGenerarActive = this.featureService.isAtributoActive(feaCodTurno, atriCodGenerar);
    this.isAtrAsignarActive = this.featureService.isAtributoActive(feaCodTurno, atriCodAsignar);
    this.isAtrGenerarExcelActive = this.featureService.isAtributoActive(feaCodTurno, atriCodGenerarExcel);
    this.isAtrCargarExcelActive = this.featureService.isAtributoActive(feaCodTurno, atriCodCargarExcel);

    this.fdIni = calendar.getToday();
    this.fhIni = calendar.getNext(calendar.getToday(), 'd', 1);

    this.fechaIniConsulta = format(startOfMonth(new Date()), 'yyyy-MM-dd HH:mm:ss');
    this.fechaFinConsulta = format(endOfMonth(new Date()), 'yyyy-MM-dd HH:mm:ss');

    this.fromDate = this.fdIni;
    this.toDate = this.fhIni;

    this.fechaIniSemana = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    this.fechaFinSemana = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

    this.actions = [
      {
        label: '<i class="fas fa-fw fa-pencil-alt"></i>',
        a11yLabel: 'Editar',
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.handleEvent('EDIT', event);
        },
      },
      {
        label: '<i class="fas fa-fw fa-trash-alt"></i>',
        a11yLabel: 'Eliminar',
        onClick: ({ event }: { event: CalendarEvent }): void => {
          this.events = this.events.filter((iEvent) => iEvent.id !== event.id);
          this.handleEvent('ELIM', event);
        },
      },
    ];

    this.formAsignaTurno = this.fb.group({
      colaborador: ['', Validators.required],
      subturnos: ['']
      // codigo: ['', Validators.required],
      // descripcion: ['', Validators.required],
      // entrada: ['', [Validators.required, Validators.pattern(/^([0-1][0-9]|2[0-4])([0-5][0-9])([0-5][0-9])?$/)]],
      // salida: ['', [Validators.required, Validators.pattern(/^([0-1][0-9]|2[0-4])([0-5][0-9])([0-5][0-9])?$/)]],
      // margenEntrada: ['', [Validators.pattern(/^([0-1][0-9]|2[0-4])([0-5][0-9])([0-5][0-9])?$/)]],
      // margenSalida: ['', [Validators.pattern(/^([0-1][0-9]|2[0-4])([0-5][0-9])([0-5][0-9])?$/)]],
      //totalHoras: [''],
      //estado: ['']
    });

    this.formEditarAsignacionTurno = this.fb.group({
      colaborador: ['', Validators.required],
      subturnos: ['']
    });

    this.ctrlFiltroTurno.valueChanges.subscribe(() => {
      this.filtroTurno = this.ctrlFiltroTurno.value || ''
    });
  }

  ngOnInit(): void {
    if (!this.isFeatureActive)
      this.router.navigate(['/home']);

    this.consultarTurnos();
    this.consultarTurnosAsignados(this.tokenService.getIdentificacion(), this.fechaIniConsulta, this.fechaFinConsulta);
    this.consultarEmpleados(this.gestionService.obtenerSuscriptorUidLocal());
    // this.ConsultaMarcacionRecursos(this.fechaIniSemana, this.fechaFinSemana);
  }

  consultarTurnos() {
    this.turnoservice.consultarTurnos().subscribe(resp => {
      // console.log(resp);
      if (resp.succeeded) {
        this.events = resp.data.turnosCalendar;
        this.lstTipoJornadaType = resp.data.tipoJornaType;
        // console.log(this.lstTipoJornadaType);

        this.tabActive = this.events.length > 0 ? this.events[0].id : '';
      }
    })
  }

  consultarMaestroTurno() {
    this.turnoservice.consultarMaestroTurno()
      .subscribe(resp => {
        // console.log(resp);
      })
  }

  consultarTurnosAsignados(identificacion: string, fechaDesde: string, fechaHasta: string) {
    console.log('Test');
    this.turnoservice.consultarTurnosAsignados(identificacion, fechaDesde, fechaHasta)
      .subscribe(resp => {
        // console.log(resp);
        this.lstAsignacion = resp.data.turnosCalendar;
        this.lstColaboradorTurno = resp.data.colaboradorTurno;

        this.lstAsignacion.map(x => x.actions = this.actions);
      });
  }

  consultarEmpleados(uidPadre: string) {
    this.turnoservice.consultarEmpleados(uidPadre).subscribe(resp => {
      if (resp.succeeded) {
        this.selectedColaborador = [];
        this.colaborador = resp.data;
        // console.log(this.colaborador)
        this.colaborador.forEach(item => {
          item['nombreCompleto'] = `${item.apellidos} ${item.nombres}`;
          item['selectedGroup'] = 'Todos';
        });
      }
    })
  }

  ConsultaMarcacionRecursos(fechaDesde: string, fechaHasta: string) {
    this.spinner.show();
    this.marcacionService.ConsultaMarcacionRecursos(this.gestionService.obtenerSuscriptorUidLocal(), fechaDesde, fechaHasta)
      .subscribe((resp: ResponseModel) => {
        // console.log(resp.data);
        if (resp.succeeded) {
          this.lstMarcacionColaborador = resp.data;
          this.dialog.open(ColaboradorTurnoMarcacionComponent, { data: this.lstMarcacionColaborador, disableClose: true, closeOnNavigation: true, autoFocus: false });
          // this.showModalColaborador = true;
        } else {
          this.toaster.warning(resp.message);
        }

        this.spinner.hide();
      }, () => { this.spinner.hide(); this.toaster.warning('No se pudo establecer la conexión'); });
  }

  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    // console.log(date, events);
    if (isSameMonth(date, this.viewDate)) {
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
      this.viewDate = date;
    }
  }

  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    // console.log(newStart, 'actual');
    let evento = this.events.map((iEvent) => {
      if (iEvent.id === event.id) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });

    this.handleEvent('ASIG', event, newStart);
  }

  handleEvent(action: string, event: CalendarEvent, fechaStart?: Date): void {
    if (this.isAtrAsignarActive && action === 'ASIG') {
      this.formAsignaTurno.reset();
      this.turnoSelected = this.obtenerTurnoById(event.id?.toString());

      this.colaboradorSubturno = [];
      this.turnoSelectedChilds = [];
      this.fromDate = { day: fechaStart?.getDate(), month: (fechaStart?.getMonth() as number) + 1, year: fechaStart?.getFullYear() } as NgbDate;// this.fdIni;
      this.toDate = this.calendar.getNext(this.fromDate, 'd', 1);//this.fhIni;
      this.procesando = false;

      this.turnoSelected.SubturnoType.forEach(x => {
        this.turnoSelectedChilds.push({
          id: x.id,
          title: `${x.codigoTurno} - (${this.fs.getTime(x.entrada)} - ${this.fs.getTime(x.salida)})`,
          selected: false
        });
      });

      this.modal.open(this.modalContent, { size: 'lg', centered: true, backdrop: 'static' });
    }

    if (action === 'VISU') {
      this.lstColaTurnoSelected = this.lstColaboradorTurno.filter(x => format(x.fechaAsignacion as Date, 'yyyy-MM-dd') === format(event.start, 'yyyy-MM-dd') && x.idTurno === event.id);
      this.lstColaTurnoSelected = this.lstColaTurnoSelected.sort((a, b) => (a.colaborador < b.colaborador) ? -1 : 1)
      this.turnoAsignadoSelected = event;
      this.modal.open(this.modalVerAsignado, { size: 'lg', centered: true, backdrop: 'static' });
    }

    if (action === 'EDIT') {
      this.lstColaTurnoSelected = this.lstColaboradorTurno.filter(x => format(x.fechaAsignacion as Date, 'yyyy-MM-dd') === format(event.start, 'yyyy-MM-dd') && x.idTurno === event.id);
      this.lstColaTurnoSelected = this.lstColaTurnoSelected.sort((a, b) => (a.colaborador < b.colaborador) ? -1 : 1)
      this.turnoAsignadoSelected = event;
      // console.log(this.lstColaTurnoSelected);

      this.colaboradorSubturnoEdit = [];
      this.turnoSelectedChildsEdit = [];
      let colaborador: Cliente[] = []
      let colaboradorId: string[] = [];

      this.lstColaTurnoSelected.forEach(x => {
        colaborador.push(this.colaborador.find(col => col.id === x.idColaborador) as Cliente);
        colaboradorId.push(x.idColaborador);
      });

      this.turnoSelectedEdit = this.obtenerTurnoById(event.id?.toString());

      this.turnoSelectedEdit.SubturnoType.forEach(x => {
        this.turnoSelectedChildsEdit.push({
          id: x.id,
          title: `${x.codigoTurno} - (${this.fs.getTime(x.entrada)} - ${this.fs.getTime(x.salida)})`,
          selected: false
        });
      });

      this.changeSelectColaEdit(colaborador);

      this.colaboradorSubturnoEdit.forEach(coSt => {
        let coTu = this.lstColaTurnoSelected.find(x => x.idColaborador === coSt.id);

        if (coTu !== undefined) {
          coSt.subturnos.forEach(st => {
            if (coTu?.subturnos.find(lsSt => lsSt.id === st.id))
              st.selected = true;
          });
        }
      });

      this.formEditarAsignacionTurno.controls['colaborador'].setValue(colaboradorId);
      this.modal.open(this.modalEditarAsignacion, { size: 'lg', centered: true, backdrop: 'static' });
    }

    if (action === 'ELIM') {
      Swal.fire({
        title: 'Se va a eliminar el turno asignado a este día y las asignaciones realizadas a tus colaboradores, \n¿estás seguro de continuar?',
        width: 400,
        showCancelButton: true,
        confirmButtonText: 'Sí',
        // confirmButtonColor: '#FE5A00',
        cancelButtonText: 'No',
        // cancelButtonColor: '#f74f75'
      }).then((result: any) => {
        if (result.isConfirmed) {
          // console.log(event);
          this.lstColaTurnoSelected = this.lstColaboradorTurno.filter(x => format(x.fechaAsignacion as Date, 'yyyy-MM-dd') === format(event.start, 'yyyy-MM-dd') && x.idTurno === event.id);
          this.lstColaTurnoSelected = this.lstColaTurnoSelected.sort((a, b) => (a.colaborador < b.colaborador) ? -1 : 1)
          this.turnoAsignadoSelected = event;

          let colaAsignado = this.lstColaTurnoSelected;
          colaAsignado.forEach(x => {
            x.selected = false
            x.subturnos.forEach(y => {
              y.selected = false;
            });
          });

          // console.log(colaAsignado);
          this.actualizarAsignacionTurnoSubturno(colaAsignado);
        }
      });
    }
  }

  addEvent(): void {
    this.newEvent = {
      title: 'New event',
      start: startOfDay(new Date()),
      end: endOfDay(new Date()),
      color: colors.red,
      draggable: true,
      actions: this.actions,
    }

    //this.events.push(this.newEvent);

    this.handleEvent('Add new event', this.newEvent);
    this.refresh.next(true);
  }

  eventDropped({
    event,
    newStart,
    newEnd,
    allDay,
  }: CalendarEventTimesChangedEvent): void {
    // const externalIndex = this.events.indexOf(event);
    // if (typeof allDay !== 'undefined') {
    //   event.allDay = allDay;
    // }
    // if (externalIndex > -1) {
    //   this.events.splice(externalIndex, 1);
    //   this.events.push(event);
    // }
    // event.start = newStart;
    // if (newEnd) {
    //   event.end = newEnd;
    // }
    // if (this.view === 'month') {
    //   this.viewDate = newStart;
    //   this.activeDayIsOpen = true;
    // }
    // this.events = [...this.events];
  }

  externalDropD(event: CalendarEvent) {
    // if (this.events.indexOf(event) === -1) {
    //   this.events = this.events.filter((iEvent) => iEvent !== event);
    //   //this.events.push(event);
    // }
  }

  externalDropN(event: CalendarEvent) {
    // if (this.events.indexOf(event) === -1) {
    //   this.events = this.events.filter((iEvent) => iEvent !== event);
    //   //this.events.push(event);
    // }
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    //this.events = this.events.filter((event) => event !== eventToDelete);
  }

  setView(view: CalendarView) {
    this.view = view;
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;

    this.fechaIniConsulta = format(startOfMonth(this.viewDate), 'yyyy-MM-dd HH:mm:ss');
    this.fechaFinConsulta = format(endOfMonth(this.viewDate), 'yyyy-MM-dd HH:mm:ss');

    this.consultarTurnosAsignados(this.tokenService.getIdentificacion(), this.fechaIniConsulta, this.fechaFinConsulta);
  }

  asignarTurno(smallmodal: any) {
    const validaForm = this.formAsignaTurno.valid;
    const fd = this.fromDate;
    const fh = this.toDate;

    if (validaForm && fd !== null && fh !== null) {
      const fdn = new Date(fd.year, fd.month - 1, fd.day);
      const fhn = new Date(fh.year, fh.month - 1, fh.day);

      if (fhn < fdn) {
        this.toaster.warning('"fecha inicial" no puede ser mayor que la "fecha final"');
        return;
      }

      const fechaHoy = new Date(this.fdIni?.year as number, (this.fdIni?.month as number) - 1, this.fdIni?.day);

      // if (fdn < fechaHoy) {
      //   this.toaster.warning('"fecha inicial" no puede ser menor que la fecha actual');
      //   return;
      // }

      const coSt = this.colaboradorSubturno;
      let asignaTurno: AsignaTurnoRequest;
      let colaborador: ClienteSubturno[] = [];
      let colaSinSubturno: string[] = [];

      coSt.forEach(co => {
        let subturnos: SubturnoAsignado[] = [];
        co.subturnos.forEach(st => {
          if (st.selected)
            subturnos.push({ idSubturno: st.id });
        });

        colaborador.push({
          idCliente: co.id,
          clienteSubturno: subturnos
        });

        if (!co.subturnos.some(x => x.selected))
          colaSinSubturno.push(co.nombre);
      });

      asignaTurno = {
        idTurno: this.turnoSelected.id,
        fechaAsignacionDesde: format(fdn, 'yyyy-MM-dd'),
        fechaAsignacionHasta: format(fhn, 'yyyy-MM-dd'),
        clienteSubturno: colaborador
      };

      // console.log(asignaTurno);

      if (colaSinSubturno.length > 0) {
        this.colaSinSubturno = colaSinSubturno;
        this.asignaTurno = asignaTurno;
        this.modal.open(smallmodal, { size: 'sm', centered: true });
        return;
      }

      this.procesando = true;
      this.asignarTurnoColaborador(asignaTurno);
    } else
      this.formAsignaTurno.markAllAsTouched();
  }

  seleccionaSubturno(uid: string, sid: string) {
    let coSt = this.colaboradorSubturno.find(x => x.id === uid) as ColaboradorSubturno;
    let st = coSt.subturnos;
    let idx = st.findIndex(x => x.id === sid);
    st[idx].selected = !st[idx].selected;
  }

  seleccionaSubturnoEdit(uid: string, sid: string) {
    let coSt = this.colaboradorSubturnoEdit.find(x => x.id === uid) as ColaboradorSubturno;
    let st = coSt.subturnos;
    let idx = st.findIndex(x => x.id === sid);
    st[idx].selected = !st[idx].selected;
  }

  crearTurno() {
    this.showModalCrear = true;
  }

  editarTurno() {
    // console.log('editar');
  }

  eliminarTurno() {
    // console.log('eliminar');
  }

  closeModalCrear() {
    this.showModalCrear = false;
  }

  obtenerTurnoById(id?: string) {
    let turnoType: TurnoType = {} as TurnoType;

    this.lstTipoJornadaType.forEach(x => {
      if (x.turnoType.find(x => x.id === id)) {
        let turno = x.turnoType.find(x => x.id === id);
        turnoType = turno == undefined ? {} as TurnoType : turno;
      }
    });

    return turnoType;
  }

  changeSelectCola(cola: Cliente[]) {
    let colaSubturno: ColaboradorSubturno[] = [];

    cola.forEach(co => {
      if (this.colaboradorSubturno.find(cs => cs.id === co.id))
        colaSubturno.push(this.colaboradorSubturno.find(cs => cs.id === co.id) as ColaboradorSubturno)
      else
        colaSubturno.push({
          id: co.id,
          nombre: co.nombreCompleto,
          subturnos: this.turnoSelectedChilds
        });
    });

    const vali = JSON.stringify(colaSubturno);
    this.colaboradorSubturno = JSON.parse(vali);
  }

  changeSelectColaEdit(cola: Cliente[]) {
    let colaSubturno: ColaboradorSubturno[] = [];

    cola.forEach(co => {
      if (this.colaboradorSubturnoEdit.find(cs => cs.id === co.id))
        colaSubturno.push(this.colaboradorSubturnoEdit.find(cs => cs.id === co.id) as ColaboradorSubturno)
      else
        colaSubturno.push({
          id: co.id,
          nombre: co.nombreCompleto,
          subturnos: this.turnoSelectedChildsEdit
        });
    });

    const vali = JSON.stringify(colaSubturno);
    this.colaboradorSubturnoEdit = JSON.parse(vali);
  }

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
      // } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
    } else if (this.fromDate && !this.toDate && date && (date.equals(this.fromDate) || date.after(this.fromDate))) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
  }

  asignarTurnoColaborador(info: AsignaTurnoRequest) {
    this.turnoservice.asignarTurnoColaborador(info)
      .subscribe((res: ResponseModel) => {
        if (res.succeeded) {
          this.modal.dismissAll();
          this.consultarTurnosAsignados(this.tokenService.getIdentificacion(), this.fechaIniConsulta, this.fechaFinConsulta);
          this.toaster.success(res.message);
        } else {
          this.toaster.error(res.message);
        }
        this.procesando = false;
      }, () => {
        this.procesando = false;
        this.toaster.error('No se pudo establecer la conexión');
      });
  }

  actualizarAsignacionTurnoSubturno(colaboradorAsignado: AsignadoColaboradorInterface[]) {
    // console.log(JSON.stringify(colaboradorAsignado));
    this.turnoservice.actualizarAsignacionTurnoSubturno(colaboradorAsignado)
      .subscribe((res: ResponseModel) => {
        if (res.succeeded) {
          this.modal.dismissAll();
          this.consultarTurnosAsignados(this.tokenService.getIdentificacion(), this.fechaIniConsulta, this.fechaFinConsulta);
          //this.ConsultaMarcacionRecursos(this.fechaIniSemana, this.fechaFinSemana);
          this.toaster.success(res.message);
        } else {
          this.toaster.error(res.message);
        }
        this.procesando = false;
      }, () => {
        this.procesando = false;
        this.toaster.error('No se pudo establecer la conexión');
      });
  }

  editarAsignarTurno(smallmodalEditar: any) {
    let form = this.formEditarAsignacionTurno;

    if (form.valid) {
      let turnoSelected = this.turnoSelectedEdit;
      let asignadoColaborador: AsignadoColaboradorInterface[] = [];
      let colaSinSubturno: string[] = [];

      this.colaboradorSubturnoEdit.forEach(coSt => {
        let asigSubturno: AsignadoSubturnoInterface[] = [];

        coSt.subturnos.forEach(st => {
          asigSubturno.push({
            id: st.id,
            // idTurnoAsignado: '',
            selected: st.selected,
            title: st.title
          });
        });

        asignadoColaborador.push({
          idTurno: turnoSelected.id,
          colaborador: coSt.nombre,
          idColaborador: coSt.id,
          fechaAsignacion: format(this.viewDate, 'yyyy-MM-dd'),// new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), this.viewDate.getDate(), 0, 0, 0),
          // idAsignacion: '',
          subturnos: asigSubturno,
          selected: true
        });

        if (!coSt.subturnos.some(x => x.selected))
          colaSinSubturno.push(coSt.nombre);
      });

      this.lstColaTurnoSelected.forEach(lsCoTuSel => {
        let asCol = asignadoColaborador.find(as => as.idColaborador === lsCoTuSel.idColaborador);
        let lsSubtruno: AsignadoSubturnoInterface[] = [];

        lsCoTuSel.subturnos.forEach(lsCoSt => {
          let asColSt = asCol?.subturnos.find(asColSt => asColSt.id === lsCoSt.id);

          if (asColSt !== undefined) {
            asColSt.idTurnoAsignado = lsCoSt.idTurnoAsignado;
          } else {
            lsSubtruno.push({
              id: lsCoSt.id,
              idTurnoAsignado: lsCoSt.idTurnoAsignado,
              selected: false,
              title: lsCoSt.title
            });
          }
        });

        if (asCol !== undefined) {
          asCol.idAsignacion = lsCoTuSel.idAsignacion;
          asCol.fechaAsignacion = format(lsCoTuSel.fechaAsignacion as Date, 'yyyy-MM-dd');

          lsSubtruno.forEach(x => {
            asCol?.subturnos.push(x);
          });
        } else {
          asignadoColaborador.push({
            idTurno: lsCoTuSel.idTurno,
            colaborador: lsCoTuSel.colaborador,
            idColaborador: lsCoTuSel.idColaborador,
            fechaAsignacion: format(lsCoTuSel.fechaAsignacion as Date, 'yyyy-MM-dd'),
            idAsignacion: lsCoTuSel.idAsignacion,
            subturnos: lsSubtruno,
            selected: false
          });
        }
      });

      if (colaSinSubturno.length > 0) {
        this.colaSinSubturno = colaSinSubturno;
        this.asignaTurnoEditar = asignadoColaborador;
        this.modal.open(smallmodalEditar, { size: 'sm', centered: true });
        return;
      }

      // console.log(asignadoColaborador);
      this.procesando = true;
      this.actualizarAsignacionTurnoSubturno(asignadoColaborador);
    } else
      this.formAsignaTurno.markAllAsTouched();
  }

  confirmacionAsignar() {
    this.procesando = true;
    this.asignarTurnoColaborador(this.asignaTurno);
  }

  confirmacionEditarAsignar() {
    this.procesando = true;
    this.actualizarAsignacionTurnoSubturno(this.asignaTurnoEditar);
  }

  infoTooltipTurno(idTipoJornada: string, idTurno: any) {
    const turnos = this.lstTipoJornadaType.find(x => x.idTipoJornada === idTipoJornada)?.turnoType;
    const t = turnos?.find(x => x.id === idTurno);
    return `${t?.totalHoras} horas / ${t?.descripcion}`;
  }

  consultarHoraColaborador() {
    this.ConsultaMarcacionRecursos(this.fechaIniSemana, this.fechaFinSemana);
  }

  closeModalColaborador() {
    this.showModalColaborador = false;
  }

  openModalGenerarArchivoExcel() {
    // this.showModalArchivoTurnosAsignados = true;

    this.dialog.open(GenerarArchivoTurnosAsignadosComponent, { disableClose: true, closeOnNavigation: true, autoFocus: false });
  }

  closeModalGenerarArchivoExcel() {
    this.showModalArchivoTurnosAsignados = false;
  }

  refreshPorCargaExcel() {
    // console.log('dfdf refresh')
    this.consultarTurnosAsignados(this.tokenService.getIdentificacion(), this.fechaIniConsulta, this.fechaFinConsulta);
  }

  changeTabEvent() {
    this.filtroTurno = '';
    this.ctrlFiltroTurno.setValue('');
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
