import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColaboradorTurnoMarcacionComponent } from './colaborador-turno-marcacion.component';

describe('ColaboradorTurnoMarcacionComponent', () => {
  let component: ColaboradorTurnoMarcacionComponent;
  let fixture: ComponentFixture<ColaboradorTurnoMarcacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColaboradorTurnoMarcacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColaboradorTurnoMarcacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
