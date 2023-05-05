import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearTurnoFormComponent } from './crear-turno-form.component';

describe('CrearTurnoFormComponent', () => {
  let component: CrearTurnoFormComponent;
  let fixture: ComponentFixture<CrearTurnoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrearTurnoFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearTurnoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
