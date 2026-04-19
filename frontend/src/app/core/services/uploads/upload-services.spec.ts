import { TestBed } from '@angular/core/testing';

import { UploadServices } from './upload-services';

describe('UploadServices', () => {
  let service: UploadServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UploadServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
