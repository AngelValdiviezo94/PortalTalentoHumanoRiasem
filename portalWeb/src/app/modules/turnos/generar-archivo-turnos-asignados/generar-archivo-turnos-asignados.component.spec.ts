import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarArchivoTurnosAsignadosComponent } from './generar-archivo-turnos-asignados.component';

describe('GenerarArchivoTurnosAsignadosComponent', () => {
  let component: GenerarArchivoTurnosAsignadosComponent;
  let fixture: ComponentFixture<GenerarArchivoTurnosAsignadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GenerarArchivoTurnosAsignadosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarArchivoTurnosAsignadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
