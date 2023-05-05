import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroAsistenciaFacialComponent } from './registro-asistencia-facial.component';

describe('RegistroAsistenciaFacialComponent', () => {
  let component: RegistroAsistenciaFacialComponent;
  let fixture: ComponentFixture<RegistroAsistenciaFacialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistroAsistenciaFacialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroAsistenciaFacialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
