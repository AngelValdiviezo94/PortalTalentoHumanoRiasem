import { Component, OnInit } from '@angular/core';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import { NgxSpinnerService } from 'ngx-spinner';
import { TokenService } from 'src/app/helper/token.service';
import { Colaborador } from 'src/app/models/cliente/colaborador';
import { Empleado } from 'src/app/models/cliente/empleado.interface';
import { MantenimientoService } from 'src/app/services/mantenimiento.service';
import { ReportesService } from 'src/app/services/reportes.service';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-certificado-laboral',
  templateUrl: './certificado-laboral.component.html',
  styleUrls: ['./certificado-laboral.component.scss']
})
export class CertificadoLaboralComponent implements OnInit {
  empleado!: any;
  certificado!: any;
  fecha: String = format(new Date(Date.now()), 'dd MMMM yyyy',{locale:es});
  mostrarsueldo:boolean=false;

  constructor(
    private mantenimientoService: MantenimientoService,
    private reportesService: ReportesService,
    private spinner: NgxSpinnerService,
    private tokenService: TokenService,
  ) { }

  ngOnInit(): void {
    this.obtenerDatos();
  }

  obtenerDatos() {
    this.spinner.show();
    this.reportesService
      .optenerEmpleado(this.tokenService.getIdentificacion())
      .subscribe(
        (resp) => {
          this.empleado = resp.data;
          this.obtenerCertificado();
          this.spinner.hide();
        },
        () => {
          this.spinner.hide();
        }
      );
  }

  obtenerCertificado() {
    this.spinner.show();
    this.reportesService
      .onbtenerCertificado(this.tokenService.getIdentificacion())
      .subscribe(
        (resp) => {
          this.certificado = resp.data;
          this.spinner.hide();
        },
        () => {
          this.spinner.hide();
        }
      );
  }

  public openPDF(): void {
    let DATA: any = document.getElementById('htmlData');
    html2canvas(DATA,{useCORS: true,allowTaint:false,logging:true}).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
      PDF.save('Certificado_Laboral.pdf');
    });
  }

  switch(event: Event){
    this.mostrarsueldo = (<HTMLInputElement>event.target).checked;
  }

}
