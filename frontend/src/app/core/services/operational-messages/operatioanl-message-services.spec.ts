import { TestBed } from '@angular/core/testing';

import { OperatioanlMessageServices } from './operatioanl-message-services';

describe('OperatioanlMessageServices', () => {
  let service: OperatioanlMessageServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OperatioanlMessageServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
