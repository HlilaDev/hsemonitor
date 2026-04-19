import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SensorDetails } from './sensor-details';

describe('SensorDetails', () => {
  let component: SensorDetails;
  let fixture: ComponentFixture<SensorDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SensorDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SensorDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
