import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalArchivoAdjuntoJustificacionComponent } from './modal-archivo-adjunto-justificacion.component';

describe('ModalArchivoAdjuntoJustificacionComponent', () => {
  let component: ModalArchivoAdjuntoJustificacionComponent;
  let fixture: ComponentFixture<ModalArchivoAdjuntoJustificacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalArchivoAdjuntoJustificacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalArchivoAdjuntoJustificacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
