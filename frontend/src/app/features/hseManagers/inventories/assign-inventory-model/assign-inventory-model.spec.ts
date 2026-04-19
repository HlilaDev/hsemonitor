import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignInventoryModel } from './assign-inventory-model';

describe('AssignInventoryModel', () => {
  let component: AssignInventoryModel;
  let fixture: ComponentFixture<AssignInventoryModel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignInventoryModel]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignInventoryModel);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
