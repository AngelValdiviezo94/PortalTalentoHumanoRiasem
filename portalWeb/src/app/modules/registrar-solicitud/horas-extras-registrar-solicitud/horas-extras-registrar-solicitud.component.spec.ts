import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorasExtrasRegistrarSolicitudComponent } from './horas-extras-registrar-solicitud.component';

describe('HorasExtrasRegistrarSolicitudComponent', () => {
  let component: HorasExtrasRegistrarSolicitudComponent;
  let fixture: ComponentFixture<HorasExtrasRegistrarSolicitudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HorasExtrasRegistrarSolicitudComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HorasExtrasRegistrarSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
