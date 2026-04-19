import { TestBed } from '@angular/core/testing';

import { ChecklistServices } from './checklist-services';

describe('ChecklistServices', () => {
  let service: ChecklistServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChecklistServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
