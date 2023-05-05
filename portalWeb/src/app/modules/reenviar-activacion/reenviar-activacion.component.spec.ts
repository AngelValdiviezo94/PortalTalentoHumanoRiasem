import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReenviarActivacionComponent } from './reenviar-activacion.component';

describe('ReenviarActivacionComponent', () => {
  let component: ReenviarActivacionComponent;
  let fixture: ComponentFixture<ReenviarActivacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReenviarActivacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReenviarActivacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
