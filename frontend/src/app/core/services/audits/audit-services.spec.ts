import { TestBed } from '@angular/core/testing';

import { AuditServices } from './audit-services';

describe('AuditServices', () => {
  let service: AuditServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuditServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
