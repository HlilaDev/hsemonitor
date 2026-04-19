import { TestBed } from '@angular/core/testing';

import { DeviceServices } from './device-services';

describe('DeviceServices', () => {
  let service: DeviceServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
