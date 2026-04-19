import { TestBed } from '@angular/core/testing';

import { IncidentEventServices } from './incident-event-services';

describe('IncidentEventServices', () => {
  let service: IncidentEventServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncidentEventServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
