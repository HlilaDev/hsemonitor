import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonitoringDashboard } from './monitoring-dashboard';

describe('MonitoringDashboard', () => {
  let component: MonitoringDashboard;
  let fixture: ComponentFixture<MonitoringDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonitoringDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonitoringDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
