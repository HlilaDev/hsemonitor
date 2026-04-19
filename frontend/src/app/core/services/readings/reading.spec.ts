import { TestBed } from '@angular/core/testing';

import { Reading } from './reading';

describe('Reading', () => {
  let service: Reading;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Reading);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
