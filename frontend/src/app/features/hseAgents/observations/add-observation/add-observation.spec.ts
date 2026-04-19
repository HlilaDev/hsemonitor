import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddObservation } from './add-observation';

describe('AddObservation', () => {
  let component: AddObservation;
  let fixture: ComponentFixture<AddObservation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddObservation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddObservation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
