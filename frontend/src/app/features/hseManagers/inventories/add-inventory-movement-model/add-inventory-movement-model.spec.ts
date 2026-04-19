import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInventoryMovementModel } from './add-inventory-movement-model';

describe('AddInventoryMovementModel', () => {
  let component: AddInventoryMovementModel;
  let fixture: ComponentFixture<AddInventoryMovementModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInventoryMovementModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInventoryMovementModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
