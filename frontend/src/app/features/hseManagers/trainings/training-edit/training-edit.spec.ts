import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingEdit } from './training-edit';

describe('TrainingEdit', () => {
  let component: TrainingEdit;
  let fixture: ComponentFixture<TrainingEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
