import { Component, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { MarcacionService } from 'src/app/services/marcacion.service';
import { map, Observable, startWith } from 'rxjs';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MantenimientoService } from 'src/app/services/mantenimiento.service';
import { ResponseModel } from 'src/app/models/response.model';
import { Colaborador, Localidad } from 'src/app/models/cliente/colaborador';
import { MatPaginator } from '@angular/material/paginator';
import { ComboMarcacion } from 'src/app/models/marcaciones/marcaciones';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { FeatureService } from 'src/app/helper/feature.service';
const feaCodTurno = environment.codFeaTurno;

@Component({
  selector: 'app-mantenimiento',
  templateUrl: './mantenimiento.component.html',
  styleUrls: ['./mantenimiento.component.scss']
})

export class MantenimientoComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  columnasGrid = ['acciones', 'codigoFeature', 'identificacionEmpleado', 'nombreEmpleado', 'idEstadoSolicitud', 'fechaCreacion'];
  dataGrid!: MatTableDataSource<Colaborador>;
  pageSize: number;

  ctrlComboUdn = new FormControl();
  ctrlComboArea = new FormControl();
  ctrlComboScc = new FormControl();
  ctrlColaborador = new FormControl('');

  lsComboUdn: ComboMarcacion[] = [];
  lsComboArea: ComboMarcacion[] = [];
  lsComboScc: ComboMarcacion[] = [];

  filteredUdn!: Observable<ComboMarcacion[]>;
  filteredArea!: Observable<ComboMarcacion[]>;
  filteredScc!: Observable<ComboMarcacion[]>;
  isFeatureActive: boolean;
  displayedColumns: string[] = [

    'nombre',
    'cedula',
    'codigo',
    'udn',
    'area',
    'subcentroCosto',
    'edicion'
  ];

  dataSource!: MatTableDataSource<Colaborador>;
  //dataSource = ELEMENT_DATA;

  constructor(private marcacionService: MarcacionService,
    private toaster: ToastrService, private spinner: NgxSpinnerService, public dialog: MatDialog, private mantenimientoservice: MantenimientoService,private router: Router,private featureService: FeatureService) { this.pageSize = 10;this.isFeatureActive = this.featureService.isFeatureActive(feaCodTurno); }

  ngOnInit(): void {
    if (!this.isFeatureActive)
      this.router.navigate(['/home']);
    this.consultarComboBitacoraMarcacionUdn();

  }

  open(colaborador: Colaborador) {
    //console.log(colaborador.lstLocalidad);
    const dialogref = this.dialog.open(DialogMantenimiento, {
      data: colaborador
    });
    dialogref.afterClosed().subscribe(result => {
      this.consultarColaborador()
    })
  }

  consultarColaborador() {
    this.spinner.show();
    this.mantenimientoservice.optenerColaboradores(this.ctrlComboUdn.value?.codigo, this.ctrlComboArea.value?.codigo, this.ctrlComboScc.value?.codigo, this.ctrlColaborador.value!)
      .subscribe((resp: ResponseModel) => {
        // console.log(resp);
        if (resp.succeeded) {
          this.dataSource = new MatTableDataSource<Colaborador>(resp.data);
          this.dataSource.paginator = this.paginator;
        }
        this.spinner.hide();
      }, () => { this.spinner.hide(); });
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
      }
    );
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
          this.filteredScc = this.ctrlComboScc.valueChanges.pipe(
            startWith(''),
            map(value => {
              const name = typeof value === 'string' ? value : value?.descripcion;
              return name ? this._filterScc(name as string) : this.lsComboScc.slice();
            }),
          );
        }
        this.spinner.hide();
      }
    );
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

  consultarCombo(codigo: string, udn: string, area: string) {
    return this.marcacionService.consultarComboBitacoraMarcacion(codigo, udn, area);
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
      this.consultarComboBitacoraMarcacionScc(this.ctrlComboUdn.value?.codigo, option.codigo);
    }
  }

  onSelectionScc(option: any) {
  }

  isControlEmpty(nombre: string): Boolean {
    if (nombre === 'UDN')
      return !this.ctrlComboUdn.value ? true : false;

    if (nombre === 'ARE')
      return !this.ctrlComboArea.value ? true : false;

    if (nombre === 'SCC')
      return !this.ctrlComboScc.value ? true : false;

    if (nombre === 'COL')
      return this.ctrlColaborador.value === '' ? true : false;

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

    if (nombre === 'SCC')
      this.ctrlComboScc.setValue('');

    if (nombre === 'COL')
      this.ctrlColaborador.setValue('');
  }

  mostrarTextoCombo(opcion: ComboMarcacion): string {
    return opcion && opcion.descripcion ? opcion.descripcion : '';
  }

}

@Component({
  selector: 'dialog-mantenimiento',
  templateUrl: 'dialogmantenimiento.html',
  styleUrls: ['./mantenimiento.component.scss']
})
export class DialogMantenimiento implements OnInit {

  ctrlComboUdn = new FormControl('');
  ctrlLocalidad = new FormControl();
  ctrlLocalidadP = new FormControl();
  ctrlJefe = new FormControl('');
  ctrlReemplazo = new FormControl('');
  lsComboUdn: ComboMarcacion[] = [];
  lsLocalidad: Localidad[] = [];
  idLocalidad: string[] = [];
  lsJefe: Colaborador[] = [];
  lsReemplazo: Colaborador[] = [];
  lsLocalidadP: Localidad[] = [];
  idJefe: string = '';
  idLocacionP: string = '';
  idReemplazo: string = '';
  filteredUdn!: Observable<ComboMarcacion[]>;
  filteredLoc!: Observable<Localidad[]>;
  filteredLocP!: Observable<Localidad[]>;
  filteredJef!: Observable<Colaborador[]>;
  filteredRem!: Observable<Colaborador[]>;

  formLocalidad!: FormGroup;
  constructor(@Inject(MAT_DIALOG_DATA) public data: Colaborador, private marcacionService: MarcacionService, private mantenimientoService: MantenimientoService, private toaster: ToastrService, public dialogRef: MatDialogRef<DialogMantenimiento>, private fb: FormBuilder) {
    this.formLocalidad = this.fb.group({
      lsLocalidad: ['', Validators.required]
    });
  }



  ngOnInit(): void {
    try {
      this.consultarComboBitacoraMarcacionUdn();
      this.consultarComboLocalidad();
      this.consultarColaborador(this.data.codUdn, this.data.codArea);
      this.ctrlComboUdn.setValue(this.data.udn);
      this.ctrlJefe.setValue(this.data.jefe);
      this.ctrlReemplazo.setValue(this.data.reemplazo);
      // console.log(this.data);
      var lstidLoc: string[] = [];
      this.data.lstLocalidad.forEach(element => {
        if(element.esPrincipal==true){this.ctrlLocalidadP.setValue(element.descripcion);
          this.idLocacionP = element.id}
        lstidLoc.push(element.id);
        this.lsLocalidadP.push(element);
      });
      // console.log(this.idLocalidad);
      this.filteredLocP = this.ctrlLocalidadP.valueChanges.pipe(startWith(''), map(value => this._filterLocP(value || '')));
      this.idLocalidad = lstidLoc;
      this.ctrlLocalidad.setValue(lstidLoc)
      //this.ctrlLocalidad.setValue(this.data.lstLocalidad);
      this.idJefe = this.data.idJefe;
      this.idReemplazo = this.data.idReemplazo;
    } catch (_) {

    }
    //this.ctrlLocalidad.setValue(this.data.lstLocalidad.descripcion)
  }
  onSelectionUdn(option: ComboMarcacion, event: any) {
    if (event.isUserInput) {
    }
  }
  private _filterUdn(value: string): ComboMarcacion[] {
    const filterValue = value.toLowerCase();
    return this.lsComboUdn.filter(option => option.descripcion.toLowerCase().includes(filterValue));
  }
  consultarComboBitacoraMarcacionUdn() {
    this.marcacionService.consultarComboBitacoraMarcacion('UD', '', '')
      .subscribe(resp => {
        if (resp.succeeded) {
          this.lsComboUdn = resp.data;
          this.filteredUdn = this.ctrlComboUdn.valueChanges.pipe(
            startWith(''),
            map(value => this._filterUdn(value || '')),
          );
        }
      });
  }
  onSelectionLoc(option: Localidad, event: any) {
    if (event.isUserInput) {
      this.idLocalidad.push(option.id);
      //this.lsLocalidadP.push(option);
    }

  }
  private _filterLoc(value: string): Localidad[] {
    const filterValue = value.toLowerCase();
    return this.lsLocalidad.filter(option => option.descripcion.toLowerCase().includes(filterValue));
  }
  consultarComboLocalidad() {
    this.mantenimientoService.obtenerLocalidad()
      .subscribe(resp => {
        if (resp.succeeded) {
          this.lsLocalidad = resp.data;
          this.selectAllForDropdownItems(this.lsLocalidad);
          this.filteredLoc = this.ctrlLocalidad.valueChanges.pipe(
            startWith(''),
            map(value => this._filterLoc(value || '')),
          );
          this.lsLocalidad.forEach(item => {
            item['descripcion'] = `${item.descripcion}`;
            //item['selectedGroup'] = 'Todos';
          })

        }
      });
  }
  changeSelectCola(loca: Localidad[]) {
    //console.log(loca)

    this.idLocalidad = []
    this.lsLocalidadP = []
    loca.forEach(co => {
      this.idLocalidad.push(co.id);
      this.lsLocalidadP.push(co);
    });
    this.filteredLocP = this.ctrlLocalidadP.valueChanges.pipe(startWith(''), map(value => this._filterLocP(value || '')));
    // console.log(this.lsLocalidadP);
  }

  consultarColaborador(udn: string, area: string) {
    this.mantenimientoService.optenerColaboradores('', '', '', '').subscribe((resp: ResponseModel) => {
      if (resp.succeeded) {
        this.lsJefe = resp.data;
        this.lsReemplazo = resp.data;
        // console.log(resp)
        this.filteredJef = this.ctrlJefe.valueChanges.pipe(startWith(''), map(value => this._filterJef(value || '')));
        this.filteredRem = this.ctrlReemplazo.valueChanges.pipe(startWith(''), map(value => this._filterRem(value || '')));
      }
    });
  }
  private _filterJef(value: string): Colaborador[] {
    const filterValue = value.toLowerCase();
    return this.lsJefe.filter(option => option.colaborador.toLowerCase().includes(filterValue));
  }
  private _filterRem(value: string): Colaborador[] {
    const filterValue = value.toLowerCase();
    return this.lsReemplazo.filter(option => option.colaborador.toLowerCase().includes(filterValue));
  }

  private _filterLocP(value: string): Localidad[] {
    const filterValue = value.toLowerCase();
    return this.lsLocalidadP.filter(option => option.descripcion.toLowerCase().includes(filterValue));
  }

  onSelectionJef(option: Colaborador, event: any) {
    if (event.isUserInput) {
      //console.log(option)
      this.idJefe = option.id
    }
  }

  onSelectionRem(option: Colaborador, event: any) {
    if (event.isUserInput) {
      //console.log(option)
      this.idReemplazo = option.id
    }
  }

  onSelectionLocP(option: Localidad, event: any) {
    if (event.isUserInput) {
      // console.log(option)
      this.idLocacionP = option.id
    }
  }

  actualizarColaborador() {
    this.mantenimientoService.actualizarColaborador(this.data.id, this.data.cedula, this.idJefe, this.idLocalidad,this.idLocacionP,this.idReemplazo).subscribe((resp: ResponseModel) => {
      // console.log(resp);
      if (resp.succeeded) {
        this.toaster.success(resp.message);
        this.closeDialog();
      } else {
        this.toaster.error(resp.message);
      }
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }
  selectAllForDropdownItems(items: any[]) {
    let allSelect = (items:any) => {
      items.forEach((element:any) => {
        element['selectedAllGroup'] = 'selectedAllGroup';
      });
    };
    allSelect(items);
  }


}
