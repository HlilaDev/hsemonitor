import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSensors } from './all-sensors';

describe('AllSensors', () => {
  let component: AllSensors;
  let fixture: ComponentFixture<AllSensors>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllSensors]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllSensors);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
