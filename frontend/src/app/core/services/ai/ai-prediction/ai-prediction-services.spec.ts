import { TestBed } from '@angular/core/testing';

import { AiPredictionServices } from './ai-prediction-services';

describe('AiPredictionServices', () => {
  let service: AiPredictionServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiPredictionServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
