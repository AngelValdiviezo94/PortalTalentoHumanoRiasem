import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { TurnosRoutingModule } from './turnos-routing.module';
import { TurnosComponent } from './turnos.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IConfig, NgxMaskModule } from 'ngx-mask';
import { CrearTurnoFormComponent } from './crear-turno-form/crear-turno-form.component';
import { ColaboradorTurnoMarcacionComponent } from './colaborador-turno-marcacion/colaborador-turno-marcacion.component';
import { MaterialExampleModule } from '../../material.module';
import { RegistrarSolicitudRoutingModule } from '../registrar-solicitud/registrar-solicitud-routing.module';
import { FiltroTurnoPipe } from './filtro-turno.pipe';
import { GenerarArchivoTurnosAsignadosComponent } from './generar-archivo-turnos-asignados/generar-archivo-turnos-asignados.component';
import { SubirArchivoTurnosComponent } from './subir-archivo-turnos/subir-archivo-turnos.component';

export const options: Partial<IConfig> | (() => Partial<IConfig>) | any = null;

registerLocaleData(localeEs);
@NgModule({
  declarations: [
    TurnosComponent,
    CrearTurnoFormComponent,
    ColaboradorTurnoMarcacionComponent,
    FiltroTurnoPipe,
    GenerarArchivoTurnosAsignadosComponent,
    SubirArchivoTurnosComponent
  ],
  imports: [
    CommonModule,
    TurnosRoutingModule,
    RegistrarSolicitudRoutingModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    NgbModule,
    NgSelectModule,
    MaterialExampleModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
  ]
})
export class TurnosModule { }
