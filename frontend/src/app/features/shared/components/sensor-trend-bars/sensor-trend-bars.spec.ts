import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorTrendBars } from './sensor-trend-bars';

describe('SensorTrendBars', () => {
  let component: SensorTrendBars;
  let fixture: ComponentFixture<SensorTrendBars>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorTrendBars]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorTrendBars);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
