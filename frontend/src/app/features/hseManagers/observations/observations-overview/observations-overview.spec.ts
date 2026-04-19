import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationsOverview } from './observations-overview';

describe('ObservationsOverview', () => {
  let component: ObservationsOverview;
  let fixture: ComponentFixture<ObservationsOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObservationsOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObservationsOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
