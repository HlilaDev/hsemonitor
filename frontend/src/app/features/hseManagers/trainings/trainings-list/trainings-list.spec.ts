import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingsList } from './trainings-list';

describe('TrainingsList', () => {
  let component: TrainingsList;
  let fixture: ComponentFixture<TrainingsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingsList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
