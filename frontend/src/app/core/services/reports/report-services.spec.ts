import { TestBed } from '@angular/core/testing';

import { ReportServices } from './report-services';

describe('ReportServices', () => {
  let service: ReportServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
