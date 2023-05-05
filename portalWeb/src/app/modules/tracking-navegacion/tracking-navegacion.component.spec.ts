import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingNavegacionComponent } from './tracking-navegacion.component';

describe('TrackingNavegacionComponent', () => {
  let component: TrackingNavegacionComponent;
  let fixture: ComponentFixture<TrackingNavegacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrackingNavegacionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrackingNavegacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
