import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./modules').then(m => m.HomeModule), canActivate: [AuthGuard] },
  { path: 'login', loadChildren: () => import('./authentication/login').then(m => m.LoginModule) },
  { path: 'formulario', loadChildren: () => import('./modules/formulario/formulario.module').then(m => m.FormularioModule) },
  { path: 'turnos', loadChildren: () => import('./modules/turnos/turnos.module').then(m => m.TurnosModule), canActivate: [AuthGuard] },
  { path: 'marcacion', loadChildren: () => import('./modules/marcacion/marcacion.module').then(m => m.MarcacionModule), canActivate: [AuthGuard] },
  { path: 'solicitudes', loadChildren: () => import('./modules/solicitudes/solicitudes.module').then(m => m.SolicitudesModule), canActivate: [AuthGuard] },
  { path: 'gestion-solicitud', loadChildren: () => import('./modules/gestion-solicitud/gestion-solicitud.module').then(m => m.GestionSolicitudModule), canActivate: [AuthGuard] },
  { path: 'control_asistencia', loadChildren: () => import('./modules/control-asistencia/control-asistencia.module').then(m => m.ControlAsistenciaModule), canActivate: [AuthGuard] },
  { path: 'registro-solicitud', loadChildren: () => import('./modules/registrar-solicitud/registrar-solicitud.module').then(m => m.RegistrarSolicitudModule), canActivate: [AuthGuard] },
  { path: 'mantenimiento', loadChildren: () => import('./modules/mantenimiento/mantenimiento.module').then(m => m.MantenimientoModule), canActivate: [AuthGuard] },
  { path: 'recuperar-contrasena', loadChildren: () => import('./authentication/recuperar-contrasena/recuperar-contrasena.module').then(m => m.RecuperarContrasenaModule) },
  { path: 'terminos-y-condiciones', loadChildren: () => import('./modules/terminos-y-condiciones/terminos-y-condiciones.module').then(m => m.TerminosYCondicionesModule) },
  { path: 'reenviar-activacion', loadChildren: () => import('./modules/reenviar-activacion/reenviar-activacion.module').then(m => m.ReenviarActivacionModule) },
  { path: 'servicio-ayuda-ubicacion', loadChildren: () => import('./modules/servicio-ayuda-ubicacion/servicio-ayuda-ubicacion.module').then(m => m.ServicioAyudaUbicacionModule) },
  { path: 'tracking-navegacion', loadChildren: () => import('./modules/tracking-navegacion/tracking-navegacion.module').then(m => m.TrackingNavegacionModule), canActivate: [AuthGuard] },
  { path: 'perfil', loadChildren: () => import('./modules/perfil/perfil.module').then(m => m.PerfilModule), canActivate: [AuthGuard] },
  { path: 'registro-asistencia', loadChildren: () => import('./modules/registro-asistencia/registro-asistencia.module').then(m => m.RegistroAsistenciaModule), canActivate: [AuthGuard] },
  { path: 'cambiocontrasena', loadChildren: () => import('./modules/cambio-contrasena/cambio-contrasena.module').then(m => m.CambioContrasenaModule), canActivate: [AuthGuard] },
  { path: 'rol-de-pago', loadChildren: () => import('./modules/rol-de-pago/rol-de-pago.module').then(m => m.RolDePagoModule) },
  { path: 'certificado-laboral', loadChildren: () => import('./modules/certificado-laboral/certificado-laboral.module').then(m => m.CertificadoLaboralModule) },
  { path: 'registro-asistencia-facial', loadChildren: () => import('./modules/registro-asistencia-facial/registro-asistencia-facial.module').then(m => m.RegistroAsistenciaFacialModule), canActivate: [AuthGuard] },
  { path: 'consulta-asistencia-novedad', loadChildren: () => import('./modules/consulta-asistencias-novedades/consulta-asistencias-novedades.module').then(m => m.ConsultaAsistenciasNovedadesModule), canActivate: [AuthGuard] },
  { path: 'soporte', loadChildren: () => import('./modules/soporte/soporte.module').then(m => m.SoporteModule) },
  { path: 'help-desk', loadChildren: () => import('./modules/help-desk/help-desk.module').then(m => m.HelpDeskModule), canActivate: [AuthGuard] },
  { path: 'configuracion-mesa', loadChildren: () => import('./modules/help-desk/configuracion-mesa/configuracion-mesa.module').then(m => m.ConfiguracionMesaModule), canActivate: [AuthGuard] },
  //{ path: 'configuracion-mesa', loadChildren: () => import('./modules/help-desk/configuracion-mesa/configuracion-mesa.module').then(m => m.ConfiguracionMesaModule) },
  { path: '**', redirectTo: 'login/error-404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
