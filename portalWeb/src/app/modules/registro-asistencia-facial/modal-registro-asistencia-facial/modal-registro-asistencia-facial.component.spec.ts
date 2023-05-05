import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRegistroAsistenciaFacialComponent } from './modal-registro-asistencia-facial.component';

describe('ModalRegistroAsistenciaFacialComponent', () => {
  let component: ModalRegistroAsistenciaFacialComponent;
  let fixture: ComponentFixture<ModalRegistroAsistenciaFacialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalRegistroAsistenciaFacialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRegistroAsistenciaFacialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
