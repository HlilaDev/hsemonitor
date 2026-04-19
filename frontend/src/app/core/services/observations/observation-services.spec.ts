import { TestBed } from '@angular/core/testing';

import { ObservationServices } from './observation-services';

describe('ObservationServices', () => {
  let service: ObservationServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ObservationServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
