import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviceManagement } from './device-management';

describe('DeviceManagement', () => {
  let component: DeviceManagement;
  let fixture: ComponentFixture<DeviceManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviceManagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviceManagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
