import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolDePagoComponent } from './rol-de-pago.component';

describe('RolDePagoComponent', () => {
  let component: RolDePagoComponent;
  let fixture: ComponentFixture<RolDePagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RolDePagoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolDePagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
