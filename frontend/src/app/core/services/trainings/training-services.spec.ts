import { TestBed } from '@angular/core/testing';

import { TrainingServices } from './training-services';

describe('TrainingServices', () => {
  let service: TrainingServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainingServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
