import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicioAyudaUbicacionComponent } from './servicio-ayuda-ubicacion.component';

describe('ServicioAyudaUbicacionComponent', () => {
  let component: ServicioAyudaUbicacionComponent;
  let fixture: ComponentFixture<ServicioAyudaUbicacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServicioAyudaUbicacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServicioAyudaUbicacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
