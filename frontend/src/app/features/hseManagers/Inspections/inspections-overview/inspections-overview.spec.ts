import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InspectionsOverview } from './inspections-overview';

describe('InspectionsOverview', () => {
  let component: InspectionsOverview;
  let fixture: ComponentFixture<InspectionsOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InspectionsOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InspectionsOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
