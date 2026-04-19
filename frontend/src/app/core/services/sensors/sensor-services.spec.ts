import { TestBed } from '@angular/core/testing';

import { SensorServices } from './sensor-services';

describe('SensorServices', () => {
  let service: SensorServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SensorServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
