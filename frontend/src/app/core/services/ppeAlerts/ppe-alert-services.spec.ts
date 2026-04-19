import { TestBed } from '@angular/core/testing';

import { PpeAlertServices } from './ppe-alert-services';

describe('PpeAlertServices', () => {
  let service: PpeAlertServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PpeAlertServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
