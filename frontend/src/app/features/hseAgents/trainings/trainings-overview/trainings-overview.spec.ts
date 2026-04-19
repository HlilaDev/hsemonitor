import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingsOverview } from './trainings-overview';

describe('TrainingsOverview', () => {
  let component: TrainingsOverview;
  let fixture: ComponentFixture<TrainingsOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingsOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingsOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
