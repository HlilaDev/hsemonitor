import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceMonitoring } from './device-monitoring';

describe('DeviceMonitoring', () => {
  let component: DeviceMonitoring;
  let fixture: ComponentFixture<DeviceMonitoring>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceMonitoring]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceMonitoring);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
