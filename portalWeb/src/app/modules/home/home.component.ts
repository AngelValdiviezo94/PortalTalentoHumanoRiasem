import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { FeatureService } from 'src/app/helper/feature.service';
import { GestionService } from 'src/app/helper/gestion.service';
import { TokenService } from 'src/app/helper/token.service';
import { Colaborador } from 'src/app/models/cliente/colaborador';
import { ResponseModel } from 'src/app/models/response.model';
import { AuthService } from 'src/app/services/auth.service';
import { MantenimientoService } from 'src/app/services/mantenimiento.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  isCanalActive!: boolean;
  isFeaTurnoActive!: boolean;
  isFeatureMarcacionActive!: boolean;
  isFeatureTransferenciaInformacionActive!: boolean;
  isFeatureEnrolamientoActive!: boolean;
  isFeatureSolicitudes!: boolean;
  isFeatureGestionSolicitudes!: boolean;
  isFeatureRegistrarPermiso!: boolean;
  isFeatureRegistrarJustificacion!: boolean;
  isFeatureRegistrarVacacion!: boolean;
  isFeatureControlAsistencia!: boolean;
  isFeatureMantenimiento!: boolean;
  isFeatureTrackingFeature!: boolean;
  isFeatureRegistroMarcacionWeb!: boolean;
  isFeatureRegistroMarcacionFacialWeb!: boolean;
  isFeatureAsistenciasNovedades!: boolean;
  isFeatureMesaDeAyuda!: boolean;

  opciones: OpcionesHome[] = [];
  empleado!: Colaborador;

  constructor(private featureService: FeatureService, private router: Router, private gestionService: GestionService, private authService: AuthService,
    private mantenimientoService: MantenimientoService,private spinner: NgxSpinnerService, private tokenService: TokenService) { }

  async ngOnInit() {
    await this.inicializar();

    if (!this.isCanalActive)
      this.timerAlert();
      this.obtenerDatos();

    // await this.validarVersion();
  }

  async validarVersion(){
    await this.authService.ValidarVersion().subscribe((resp:ResponseModel)=>{
      if(!resp.data)
      window.location.reload();
    });
  }

  obtenerDatos() {
    this.spinner.show();
    this.mantenimientoService
      .optenerColaboradores('', '', '', this.tokenService.getIdentificacion())
      .subscribe(
        (resp) => {
          this.empleado = resp.data[0];
          this.gestionService.guardaSuscriptorFoto(this.empleado.fotoPerfil);
          this.spinner.hide();
        },
        () => {
          this.spinner.hide();
        }
      );
  }

  timerAlert() {
    Swal.fire({
      title: 'Acceso restringido',
      text: 'No posee acceso al canal',
      confirmButtonColor: '#FE5A00',
      timer: 5000,
      timerProgressBar: true,
      width: 350
    }).then(() => {
      this.router.navigate(['/login']);
    });
  }

  async inicializar() {
    if (Object.keys(this.gestionService.obtenerInfoCargoSuscriptorLocal()).length === 0)
      await this.getInfoCargoAsync();

    this.isCanalActive = this.featureService.isCanalActive();
    this.isFeatureEnrolamientoActive = this.featureService.isFeatureActive(environment.codFeaEnrolamiento);
    this.isFeaTurnoActive = this.featureService.isFeatureActive(environment.codFeaTurno);
    this.isFeatureMarcacionActive = this.featureService.isFeatureActive(environment.codFeaMarcacion);
    this.isFeatureTransferenciaInformacionActive = this.featureService.isFeatureActive(environment.codFeaTransferenciaInformacion);
    this.isFeatureSolicitudes = this.featureService.isFeatureActive(environment.codFeaSolicitudes);
    this.isFeatureGestionSolicitudes = this.featureService.isFeatureActive(environment.codFeaGestionSolicitudes);
    this.isFeatureRegistrarPermiso = this.featureService.isFeatureActive(environment.codFeaRegistrarSolicitudPermiso);
    this.isFeatureRegistrarJustificacion = this.featureService.isFeatureActive(environment.codFeaRegistrarSolicitudJustificacion);
    this.isFeatureRegistrarVacacion = this.featureService.isFeatureActive(environment.codFeaRegistrarSolicitudVacacion);
    this.isFeatureControlAsistencia = this.featureService.isFeatureActive(environment.codFeaControlAsistencia);
    this.isFeatureMantenimiento = this.featureService.isFeatureActive(environment.codFeaMantenimiento);
    this.isFeatureTrackingFeature = this.featureService.isFeatureActive(environment.codFeaTrackingFeature);
    this.isFeatureRegistroMarcacionWeb = this.featureService.isFeatureActive(environment.codFeaRegistroMarcacionWeb);
    this.isFeatureRegistroMarcacionFacialWeb = this.featureService.isFeatureActive(environment.codFeaRegistroMarcacionFacialWeb);
    this.isFeatureAsistenciasNovedades = this.featureService.isFeatureActive(environment.codFeaAsistenciasNovedades);
    this.isFeatureMesaDeAyuda = this.featureService.isFeatureActive(environment.codFeaMesaDeAyuda);

    this.CargaOpcionesMenu();
  }

  private async getInfoCargoAsync() {
    const infoCargo = await this.featureService.getInfoCargoAsync();
    this.gestionService.guardaInfoCargoSuscriptorLocal(infoCargo.data);
  }

  private CargaOpcionesMenu() {
    if (this.isFeatureEnrolamientoActive)
      this.opciones.push({ titulo: 'Enrolamiento', ruta: '/formulario', claseCss: '#029901', orden: 1, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuEnrolamiento.png' });

    if (this.isFeaTurnoActive)
      this.opciones.push({ titulo: 'Turnos', ruta: '/turnos', claseCss: '#FF6602', orden: 2, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuTurnos.png' });

    if (this.isFeatureMarcacionActive)
      this.opciones.push({ titulo: 'Marcaciones / Registro', ruta: '/marcacion', claseCss: '#FF3333', orden: 3, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuMarcacion.png' });

    if (this.isFeatureTransferenciaInformacionActive)
      this.opciones.push({ titulo: 'Transferencia de Información', ruta: '', claseCss: 'btn btn-color-4', orden: 4, imagen: '' });

    if (this.isFeatureGestionSolicitudes)
      this.opciones.push({ titulo: 'Gestión solicitudes', ruta: '/gestion-solicitud', claseCss: '#9747FF', orden: 5, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuSolicitudes.png' });

    // if (this.isFeatureSolicitudes)
    //   this.opciones.push({ titulo: 'Solicitudes', ruta: '/solicitudes', claseCss: 'btn btn-color-6', orden: 6 });

    if (this.isFeatureRegistrarPermiso || this.isFeatureRegistrarJustificacion || this.isFeatureRegistrarVacacion)
      this.opciones.push({ titulo: 'Registro solicitudes', ruta: '/registro-solicitud', claseCss: '#ED008C', orden: 7, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuRegistro.png' });

    if (this.isFeatureControlAsistencia)
      this.opciones.push({ titulo: 'Control de Asistencia', ruta: '/control_asistencia', claseCss: '#1DB9DC', orden: 8, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuAsistencia.png' });

    if (this.isFeatureMantenimiento)
      this.opciones.push({ titulo: 'Mantenimiento', ruta: '/mantenimiento', claseCss: '#DBA21D', orden: 9, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuMantenimiento.png' });

    if (this.isFeatureTrackingFeature)
      this.opciones.push({ titulo: 'Tracking navegación', ruta: '/tracking-navegacion', claseCss: '#295EF1', orden: 10, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuTrackingO.png' });

    if (this.isFeatureRegistroMarcacionWeb)
      this.opciones.push({ titulo: 'Registro asistencia', ruta: '/registro-asistencia', claseCss: '#029991', orden: 11, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuMarcacionHuella.png' });

    if (this.isFeatureRegistroMarcacionFacialWeb)
      this.opciones.push({ titulo: 'Registro asistencia facial', ruta: '/registro-asistencia-facial', claseCss: '#558B02', orden: 12, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuMarcacionFacial.png' });

    if (this.isFeatureAsistenciasNovedades)
      this.opciones.push({ titulo: 'Asistencias y novedades', ruta: '/consulta-asistencia-novedad', claseCss: '#9E7828', orden: 13, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuAsistenciaNov.png' })

    if (this.isFeatureMesaDeAyuda)
      this.opciones.push({ titulo: 'Mesa de Ayuda', ruta: '/help-desk', claseCss: '#ED1459', orden: 14, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuMesaAyuda.png' })

  }

}

export interface OpcionesHome {
  titulo: string,
  imagen?: string,
  ruta: string,
  claseCss: string,
  orden: number
}
