import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingCreate } from './training-create';

describe('TrainingCreate', () => {
  let component: TrainingCreate;
  let fixture: ComponentFixture<TrainingCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
