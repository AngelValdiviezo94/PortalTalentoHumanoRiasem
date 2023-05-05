import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-soporte',
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.scss']
})
export class SoporteComponent implements OnInit {

  mailText:string = "";
  constructor() { }

  ngOnInit(): void {
    this.mailText = "mailto:admin@enrolapp.ec?subject=Soporte&body=Solicitud de ayuda";
  }

}
