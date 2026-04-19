import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingParticipants } from './training-participants';

describe('TrainingParticipants', () => {
  let component: TrainingParticipants;
  let fixture: ComponentFixture<TrainingParticipants>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingParticipants]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingParticipants);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
