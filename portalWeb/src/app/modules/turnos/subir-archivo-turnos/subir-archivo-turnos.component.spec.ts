import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubirArchivoTurnosComponent } from './subir-archivo-turnos.component';

describe('SubirArchivoTurnosComponent', () => {
  let component: SubirArchivoTurnosComponent;
  let fixture: ComponentFixture<SubirArchivoTurnosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubirArchivoTurnosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubirArchivoTurnosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
