import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ReportesService } from 'src/app/services/reportes.service';
import { ResponseModel } from 'src/app/models/response.model';
import { RolDePago } from 'src/app/models/rolDePago/rol-de-pago.model';

@Component({
  selector: 'app-rol-de-pago',
  templateUrl: './rol-de-pago.component.html',
  styleUrls: ['./rol-de-pago.component.scss'],
})
export class RolDePagoComponent implements OnInit {
  rol!:RolDePago;
  constructor(private reporteservice:ReportesService) {}
  @ViewChild('htmlData') htmlData!: ElementRef;

  ngOnInit(): void {
    this.obtenerRol();
  }

  public openPDF(): void {
    let DATA: any = document.getElementById('htmlData');
    html2canvas(DATA).then((canvas) => {
      let fileWidth = 208;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 0;
      PDF.addImage(FILEURI, 'PNG', 0, position, fileWidth, fileHeight);
      PDF.save('angular-demo.pdf');
    });
  }

  obtenerRol(){
    this.reporteservice.onbtenerRolDePago('0951810993','2023-01').subscribe((resp:ResponseModel)=>{
      this.rol=resp.data;
    })
  }

}
