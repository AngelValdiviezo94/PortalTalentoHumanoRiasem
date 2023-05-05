import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FeatureService } from 'src/app/helper/feature.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { GestionService } from 'src/app/helper/gestion.service';
import { MesaAyudaService } from 'src/app/services/mesa-ayuda.service';
import { Observable } from 'rxjs';
import { ConfiguracionMesaModel } from 'src/app/models/mesa-ayuda/configuracion-mesa.models';
import { ToastrService } from 'ngx-toastr';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { format, startOfMonth } from 'date-fns';

@Component({
  selector: 'app-configuracion-mesa',
  templateUrl: './configuracion-mesa.component.html',
  styleUrls: ['./configuracion-mesa.component.scss']
})

export class ConfiguracionMesaComponent implements AfterViewInit, OnInit {
  estadoMesa: string = "Inactivo";
  estadoMesaValor: string = "1";
  descripcionTxt = new FormControl('', Validators.maxLength(300));
  isCanalActive!: boolean;
  listadoMesa: ConfiguracionMesaModel[] = [];
  fechaDesdeIni: Date = startOfMonth(new Date());
  desdecontrol = new FormControl(
    this.fechaDesdeIni.toISOString(),
    Validators.required
  );

  constructor(private featureService: MesaAyudaService, private router: Router,private gestionService: GestionService) { }

  async ngOnInit() {
    var desden = format(
      new Date(this.desdecontrol.value as string),
      'yyyy-MM-dd'
    );
    this.inicializar();
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

  ngAfterViewInit() {

  }

  async inicializar() {
    this.estadoMesaValor = '1';
    this.estadoMesa = 'Inactivo';
    //this.listadoMesa = this.featureService.obtenerCatalogoMesa();
/*
    this.featureService.obtenerCatalogoMesa()
      .subscribe({
        next: (resp: any) => {
          if (resp != null){
            this.listadoMesa = resp;
            console.log('Test');
          }
        },
        error: () => {
          // this.spinner.hide();
          //this.toaster.error('No se pudo establecer la conexión');
        }
      });
      */
  }

  changeEstado() {
    if(this.estadoMesa == 'Activo') {
      this.estadoMesaValor = '0';
      this.estadoMesa = 'Inactivo';

    } else {
      this.estadoMesaValor = '1';
      this.estadoMesa = 'Activo';
    }
  }

}

/*
export interface ConfiguracionMesa {
  fechaDesdeHabil?: Date,
  fechaHastaHabil?: Date,
  idUdn: string,
  nombreComercial: string,
  id: string,
  codigo: string,
  nombre: string
}
*/
/*

"fechaDesdeHabil": null,
      "fechaHastaHabil": null,
      "idUdn": "5f448e6d-c6d5-43c1-ad69-5a1ac7ecb5e1",
      "nombreComercial": "GRUPO RIASEM",
      "id": "17ecc9de-04c8-416a-7346-08db27d625f7",
      "codigo": "SG",
      "nombre": "SERVICIOS GENERALES"

*/
