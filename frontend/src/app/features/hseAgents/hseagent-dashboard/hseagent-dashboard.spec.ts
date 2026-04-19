import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HseagentDashboard } from './hseagent-dashboard';

describe('HseagentDashboard', () => {
  let component: HseagentDashboard;
  let fixture: ComponentFixture<HseagentDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HseagentDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HseagentDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
