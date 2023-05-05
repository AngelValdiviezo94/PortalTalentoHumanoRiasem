import { Component, OnInit } from '@angular/core';
import { FeatureService } from 'src/app/helper/feature.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { GestionService } from 'src/app/helper/gestion.service';

@Component({
  selector: 'app-help-desk',
  templateUrl: './help-desk.component.html',
  styleUrls: ['./help-desk.component.scss']
})
export class HelpDeskComponent implements OnInit {
  isCanalActive!: boolean;
  isFeatureConfigMesaDeAyuda!: boolean;
  isFeatureConfigServicioMesaDeAyuda!: boolean;
  isFeatureConfigTipoInfoMesaAyuda!: boolean;
  isFeatureConfigTipoInfoEncuesta!: boolean;
  isFeatureConfigTipoInfoReportes!: boolean;
  isFeatureConfigTipoInfoTicket!: boolean;
  opciones: OpcionesHelpDesk[] = [];

  constructor(private featureService: FeatureService, private router: Router,private gestionService: GestionService) { }

  async ngOnInit() {
    await this.inicializar();
    if (!this.isCanalActive)
      this.timerAlert();
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
    this.isFeatureConfigMesaDeAyuda = this.featureService.isAtributoActive(environment.codFeaMesaDeAyuda, environment.codFeaMesaDeAyudaAtrConfMesa);
    this.isFeatureConfigServicioMesaDeAyuda = this.featureService.isAtributoActive(environment.codFeaMesaDeAyuda, environment.codFeaMesaDeAyudaAtrConfServicioMesa);
    this.isFeatureConfigTipoInfoMesaAyuda = this.featureService.isAtributoActive(environment.codFeaMesaDeAyuda, environment.codFeaMesaDeAyudaAtrConfTipoInfoMesa);
    this.isFeatureConfigTipoInfoEncuesta = this.featureService.isAtributoActive(environment.codFeaMesaDeAyuda, environment.codFeaMesaDeAyudaAtrEncuestaMesa);
    this.isFeatureConfigTipoInfoReportes = this.featureService.isAtributoActive(environment.codFeaMesaDeAyuda, environment.codFeaMesaDeAyudaAtrRptMesa);
    this.isFeatureConfigTipoInfoTicket = this.featureService.isAtributoActive(environment.codFeaMesaDeAyuda, environment.codFeaMesaDeAyudaAtrTicketMesa);
    //
    this.CargaOpcionesMenuHelpDesk();
  }

  private CargaOpcionesMenuHelpDesk() {
    if (this.isFeatureConfigMesaDeAyuda)
      this.opciones.push({ titulo: 'Configuración de mesa', ruta: '/configuracion-mesa', claseCss: '#ED1459', orden: 1, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuMesaAyuda.png' });

    if (this.isFeatureConfigServicioMesaDeAyuda)
      this.opciones.push({ titulo: 'Configuración de servicio', ruta: '/help-desk', claseCss: '#ED1459', orden: 2, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuMesaAyuda.png' });

    if (this.isFeatureConfigTipoInfoMesaAyuda)
      this.opciones.push({ titulo: 'Configuración de tipo de información', ruta: '/help-desk', claseCss: '#ED1459', orden: 3, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuMesaAyuda.png' });

    if (this.isFeatureConfigTipoInfoEncuesta)
      this.opciones.push({ titulo: 'Encuesta de orden de servicio', ruta: '/help-desk', claseCss: '#ED1459', orden: 4, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuMesaAyuda.png' });

    if (this.isFeatureConfigTipoInfoReportes)
      this.opciones.push({ titulo: 'Reportes', ruta: '/help-desk', claseCss: '#ED1459', orden: 5, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuMesaAyuda.png' });

    if(this.isFeatureConfigTipoInfoTicket)
    this.opciones.push({ titulo: 'Ticket', ruta: '/help-desk', claseCss: '#ED1459', orden: 6, imagen: 'https://imagenes.enrolapp.ec/Archivos/Riasem/EnrolApp/imagenes/icMenuMesaAyuda.png' });
  }

  private async getInfoCargoAsync() {
    const infoCargo = await this.featureService.getInfoCargoAsync();
    this.gestionService.guardaInfoCargoSuscriptorLocal(infoCargo.data);
  }

}

export interface OpcionesHelpDesk {
  titulo: string,
  imagen?: string,
  ruta: string,
  claseCss: string,
  orden: number
}
