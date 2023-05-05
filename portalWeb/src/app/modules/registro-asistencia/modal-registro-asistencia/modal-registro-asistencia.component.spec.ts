import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRegistroAsistenciaComponent } from './modal-registro-asistencia.component';

describe('ModalRegistroAsistenciaComponent', () => {
  let component: ModalRegistroAsistenciaComponent;
  let fixture: ComponentFixture<ModalRegistroAsistenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRegistroAsistenciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRegistroAsistenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
