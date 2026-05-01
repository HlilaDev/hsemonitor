import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentsOverview } from './incidents-overview';

describe('IncidentsOverview', () => {
  let component: IncidentsOverview;
  let fixture: ComponentFixture<IncidentsOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentsOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidentsOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
