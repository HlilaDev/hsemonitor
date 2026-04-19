import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpeAlertsOverview } from './ppe-alerts-overview';

describe('PpeAlertsOverview', () => {
  let component: PpeAlertsOverview;
  let fixture: ComponentFixture<PpeAlertsOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PpeAlertsOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpeAlertsOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
