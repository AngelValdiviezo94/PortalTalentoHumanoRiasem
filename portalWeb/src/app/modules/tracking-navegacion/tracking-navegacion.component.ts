import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { format, startOfMonth } from 'date-fns';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { map, Observable, startWith } from 'rxjs';
import { FeatureService } from 'src/app/helper/feature.service';
import { ComboTrackingFeature, InfoTrackingFeature } from 'src/app/models/cargo/tracking-feature.interface';
import { ResponseModel } from 'src/app/models/response.model';
import { CargoService } from 'src/app/services/cargo.service';
import { environment } from 'src/environments/environment';

const feaCodTrackFeat = environment.codFeaTrackingFeature;
const atriConsultar = 'CON';

@Component({
  selector: 'app-tracking-navegacion',
  templateUrl: './tracking-navegacion.component.html',
  styleUrls: ['./tracking-navegacion.component.scss']
})
export class TrackingNavegacionComponent implements OnInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isFeatureActive: boolean;
  isAtrConsultarActive: boolean;

  dataGrid!: MatTableDataSource<InfoTrackingFeature>;
  columnasGrid = ['canalNombre', 'featureNombre', 'actividad', 'fechaRegistro', 'colaborador'];
  pageSize: number;

  fechaDesdeIni: Date = startOfMonth(new Date());

  ctrlCanal = new FormControl(undefined as any, Validators.required);
  ctrlFeature = new FormControl(undefined as any);
  ctrlColaborador = new FormControl('');
  ctrlFechaDesde = new FormControl(this.fechaDesdeIni.toISOString(), Validators.required);
  ctrlFechaHasta = new FormControl(new Date().toISOString(), Validators.required);

  infoCanales: ComboTrackingFeature[] = [];
  infoFeatures: ComboTrackingFeature[] = [];
  featuresRaw: ComboTrackingFeature[] = [];

  filteredCanal!: Observable<ComboTrackingFeature[]>;
  filteredfeature!: Observable<ComboTrackingFeature[]>;

  constructor(private trackingService: CargoService, private spinner: NgxSpinnerService, private toaster: ToastrService,
    private featureService: FeatureService, private router: Router) {
    this.pageSize = 10;

    this.isFeatureActive = this.featureService.isFeatureActive(feaCodTrackFeat);
    this.isAtrConsultarActive = this.featureService.isAtributoActive(feaCodTrackFeat, atriConsultar);
  }

  ngOnInit(): void {
    if (!this.isFeatureActive)
      this.router.navigate(['/home']);

    this.ObtenerComboTrackingFeature();
  }

  ObtenerInfoTrackingFeature(canalId: string, featureId: string, colaborador: string, fechaDesde: string, fechaHasta: string) {
    this.spinner.show();
    this.trackingService.ObtenerInfoTrackingFeature(canalId, featureId, colaborador, fechaDesde, fechaHasta)
      .subscribe({
        next: (resp: ResponseModel) => {
          // console.log(resp);
          if (resp.succeeded) {
            let info: InfoTrackingFeature[] = resp.data;
            info.map(x => x.fechaRegistro = new Date(x.fechaRegistro));

            this.dataGrid = new MatTableDataSource<InfoTrackingFeature>(resp.data);
            this.dataGrid.paginator = this.paginator;
            this.dataGrid.sort = this.sort;
          } else {
            this.toaster.warning(resp.message);
          }
          this.spinner.hide();
        },
        error: () => {
          this.spinner.hide();
          this.toaster.error('No se pudo establecer la conexión');
        }
      });
  }

  ObtenerComboTrackingFeature() {
    // this.spinner.show();
    this.trackingService.ObtenerComboTrackingFeature()
      .subscribe({
        next: (resp: ResponseModel) => {
          if (resp.succeeded) {
            // console.log(resp.data);
            this.infoCanales = resp.data.canales;
            this.featuresRaw = resp.data.features;

            this.filteredCanal = this.ctrlCanal.valueChanges.pipe(
              startWith(''),
              map(value => {
                const name = typeof value === 'string' ? value : value?.descripcion;
                return name ? this._filterCanal(name as string) : this.infoCanales.slice();
              }));

            this.filteredfeature = this.ctrlFeature.valueChanges.pipe(
              startWith(''),
              map(value => {
                const name = typeof value === 'string' ? value : value?.descripcion;
                return name ? this._filterFeature(name as string) : this.infoFeatures.slice();
              }));
          } else {
            this.toaster.warning(resp.message);
          }
          // this.spinner.hide();
        },
        error: () => {
          // this.spinner.hide();
          this.toaster.error('No se pudo establecer la conexión');
        }
      });
  }

  buscar() {
    if (this.ctrlCanal.valid && this.ctrlFechaDesde.valid && this.ctrlFechaHasta.valid) {
      if (this.ctrlFechaHasta.value! < this.ctrlFechaDesde.value!) {
        this.toaster.warning('"Fecha desde" no puede ser mayor que la "fecha hasta"');
        return;
      }

      this.ObtenerInfoTrackingFeature(
        this.ctrlCanal.value?.codigo || '',
        this.ctrlFeature.value?.codigo || '',
        this.ctrlColaborador.value || '',
        `${format(new Date(this.ctrlFechaDesde.value as string), 'yyyy-MM-dd')} 00:00:00`,
        `${format(new Date(this.ctrlFechaHasta.value as string), 'yyyy-MM-dd')} 23:59:59`);
    } else {
      this.ctrlCanal.markAllAsTouched();
      this.ctrlFechaDesde.markAllAsTouched();
      this.ctrlFechaHasta.markAllAsTouched();
    }
  }

  onSelectionCanal(option: ComboTrackingFeature, event: any) {
    // console.log(option, event);
    if (event.isUserInput) {
      this.infoFeatures = this.featuresRaw.filter(x => x.padreId === option.codigo);
      this.ctrlFeature.setValue('');
    }
  }

  private _filterCanal(value: string): ComboTrackingFeature[] {
    const filterValue = value.toLowerCase();

    return this.infoCanales.filter(option => option.descripcion.toLowerCase().includes(filterValue));
  }

  private _filterFeature(value: string): ComboTrackingFeature[] {
    const filterValue = value.toLowerCase();

    return this.infoFeatures.filter(option => option.descripcion.toLowerCase().includes(filterValue));
  }

  mostrarTextoCombo(opcion: ComboTrackingFeature): string {
    return opcion && opcion.descripcion ? opcion.descripcion : '';
  }

  isControlEmpty(nombre: string): Boolean {
    if (nombre === 'CAN')
      return !this.ctrlCanal.value ? true : false;

    if (nombre === 'FEA')
      return !this.ctrlFeature.value ? true : false;

    if (nombre === 'COL')
      return this.ctrlColaborador.value === '' ? true : false;

    return true;
  }

  limpiarControl(nombre: String): void {
    if (nombre === 'CAN') {
      this.ctrlCanal.setValue('');
      //this.filteredfeature = new Observable<ComboTrackingFeature[]>();
    }

    if (nombre === 'FEA') {
      this.ctrlFeature.setValue(undefined);
    }

    if (nombre === 'COL')
      this.ctrlColaborador.setValue('');
  }

}
