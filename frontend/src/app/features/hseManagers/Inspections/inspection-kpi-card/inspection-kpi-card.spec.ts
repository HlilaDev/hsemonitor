import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionKpiCard } from './inspection-kpi-card';

describe('InspectionKpiCard', () => {
  let component: InspectionKpiCard;
  let fixture: ComponentFixture<InspectionKpiCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectionKpiCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InspectionKpiCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
