import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacacionRegistrarSolicitudComponent } from './vacacion-registrar-solicitud.component';

describe('VacacionRegistrarSolicitudComponent', () => {
  let component: VacacionRegistrarSolicitudComponent;
  let fixture: ComponentFixture<VacacionRegistrarSolicitudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VacacionRegistrarSolicitudComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VacacionRegistrarSolicitudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
