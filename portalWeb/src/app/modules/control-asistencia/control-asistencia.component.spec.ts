import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlAsistenciaComponent } from './control-asistencia.component';

describe('ControlAsistenciaComponent', () => {
  let component: ControlAsistenciaComponent;
  let fixture: ComponentFixture<ControlAsistenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControlAsistenciaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlAsistenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
