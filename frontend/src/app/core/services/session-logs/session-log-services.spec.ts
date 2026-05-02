import { TestBed } from '@angular/core/testing';

import { SessionLogServices } from './session-log-services';

describe('SessionLogServices', () => {
  let service: SessionLogServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionLogServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
