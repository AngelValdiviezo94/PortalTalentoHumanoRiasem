import { Component, EventEmitter, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-crear-turno-form',
  templateUrl: './crear-turno-form.component.html',
  styleUrls: ['./crear-turno-form.component.scss']
})
export class CrearTurnoFormComponent implements OnInit {
  @ViewChild('modalContent', { static: true }) modalContent!: TemplateRef<any>;
  @Output() eventCloseModal: EventEmitter<any> = new EventEmitter();

  formTurno: FormGroup;

  constructor(private modalService: NgbModal, private fb: FormBuilder) {
    this.formTurno = this.fb.group({
      codigo: ['', Validators.required],
      descripcion: ['', Validators.required],
      entrada: ['', [Validators.required, Validators.pattern(/^([0-1][0-9]|2[0-4])([0-5][0-9])([0-5][0-9])?$/)]],
      salida: ['', [Validators.required, Validators.pattern(/^([0-1][0-9]|2[0-4])([0-5][0-9])([0-5][0-9])?$/)]],
      margenEntrada: ['', [Validators.pattern(/^([0-1][0-9]|2[0-4])([0-5][0-9])([0-5][0-9])?$/)]],
      margenSalida: ['', [Validators.pattern(/^([0-1][0-9]|2[0-4])([0-5][0-9])([0-5][0-9])?$/)]],
      totalHoras: [''],
      estado: ['']
    });
  }

  ngOnInit(): void {
    this.modalService.open(this.modalContent, { size: 'md', scrollable: true, centered: true });
  }

  closeModal() {
    this.modalService.dismissAll();
    this.eventCloseModal.emit();
  }

}