import { TestBed } from '@angular/core/testing';

import { IncidentsStatsServices } from './incidents-stats-services';

describe('IncidentsStatsServices', () => {
  let service: IncidentsStatsServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncidentsStatsServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
