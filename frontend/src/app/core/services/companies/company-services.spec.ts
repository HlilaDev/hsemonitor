import { TestBed } from '@angular/core/testing';

import { CompanyServices } from './company-services';

describe('CompanyServices', () => {
  let service: CompanyServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
