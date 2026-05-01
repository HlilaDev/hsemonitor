import { TestBed } from '@angular/core/testing';

import { RoleRedirectServices } from './role-redirect-services';

describe('RoleRedirectServices', () => {
  let service: RoleRedirectServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleRedirectServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
