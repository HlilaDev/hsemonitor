import { TestBed } from '@angular/core/testing';

import { InventoryServices } from './inventory-services';

describe('InventoryServices', () => {
  let service: InventoryServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
