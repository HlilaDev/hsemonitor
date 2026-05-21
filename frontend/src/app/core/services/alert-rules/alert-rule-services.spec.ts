import { TestBed } from '@angular/core/testing';

import { AlertRuleServices } from './alert-rule-services';

describe('AlertRuleServices', () => {
  let service: AlertRuleServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertRuleServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
