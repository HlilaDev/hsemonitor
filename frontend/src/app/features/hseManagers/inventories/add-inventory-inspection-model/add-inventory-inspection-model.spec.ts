import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInventoryInspectionModel } from './add-inventory-inspection-model';

describe('AddInventoryInspectionModel', () => {
  let component: AddInventoryInspectionModel;
  let fixture: ComponentFixture<AddInventoryInspectionModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInventoryInspectionModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInventoryInspectionModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
