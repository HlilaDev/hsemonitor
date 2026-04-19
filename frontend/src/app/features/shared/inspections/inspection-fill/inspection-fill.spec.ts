import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionFill } from './inspection-fill';

describe('InspectionFill', () => {
  let component: InspectionFill;
  let fixture: ComponentFixture<InspectionFill>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectionFill]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InspectionFill);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
