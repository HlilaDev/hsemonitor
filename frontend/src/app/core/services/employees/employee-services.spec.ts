import { TestBed } from '@angular/core/testing';

import { EmployeeServices } from './employee-services';

describe('EmployeeServices', () => {
  let service: EmployeeServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeeServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
