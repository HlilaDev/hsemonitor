import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingDetails } from './training-details';

describe('TrainingDetails', () => {
  let component: TrainingDetails;
  let fixture: ComponentFixture<TrainingDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
