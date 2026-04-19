import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingDetail } from './training-detail';

describe('TrainingDetail', () => {
  let component: TrainingDetail;
  let fixture: ComponentFixture<TrainingDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
