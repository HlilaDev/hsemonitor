import { TestBed } from '@angular/core/testing';

import { SocketServices } from './socket-services';

describe('SocketServices', () => {
  let service: SocketServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SocketServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
