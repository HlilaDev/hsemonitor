import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditInventory } from './edit-inventory';

describe('EditInventory', () => {
  let component: EditInventory;
  let fixture: ComponentFixture<EditInventory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditInventory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditInventory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
