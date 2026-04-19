import { TestBed } from '@angular/core/testing';

import { ZoneServices } from './zone-services';

describe('ZoneServices', () => {
  let service: ZoneServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ZoneServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
