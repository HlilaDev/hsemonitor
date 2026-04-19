import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorTrendCurve } from './sensor-trend-curve';

describe('SensorTrendCurve', () => {
  let component: SensorTrendCurve;
  let fixture: ComponentFixture<SensorTrendCurve>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorTrendCurve]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorTrendCurve);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
