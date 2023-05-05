import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaAsistenciasNovedadesComponent } from './consulta-asistencias-novedades.component';

describe('ConsultaAsistenciasNovedadesComponent', () => {
  let component: ConsultaAsistenciasNovedadesComponent;
  let fixture: ComponentFixture<ConsultaAsistenciasNovedadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultaAsistenciasNovedadesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaAsistenciasNovedadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
