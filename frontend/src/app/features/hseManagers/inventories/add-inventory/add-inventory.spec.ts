import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInventory } from './add-inventory';

describe('AddInventory', () => {
  let component: AddInventory;
  let fixture: ComponentFixture<AddInventory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInventory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddInventory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
