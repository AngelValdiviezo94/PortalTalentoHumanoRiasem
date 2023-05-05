import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JustificacionRegistrarSolicitudComponent } from './justificacion-registrar-solicitud.component';

describe('JustificacionRegistrarSolicitudComponent', () => {
  let component: JustificacionRegistrarSolicitudComponent;
  let fixture: ComponentFixture<JustificacionRegistrarSolicitudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JustificacionRegistrarSolicitudComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JustificacionRegistrarSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
