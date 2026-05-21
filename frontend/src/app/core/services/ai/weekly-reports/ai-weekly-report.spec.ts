import { TestBed } from '@angular/core/testing';

import { AiWeeklyReport } from './ai-weekly-report';

describe('AiWeeklyReport', () => {
  let service: AiWeeklyReport;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiWeeklyReport);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
