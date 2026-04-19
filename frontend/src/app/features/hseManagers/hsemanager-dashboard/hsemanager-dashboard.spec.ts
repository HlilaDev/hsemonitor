import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HsemanagerDashboard } from './hsemanager-dashboard';

describe('HsemanagerDashboard', () => {
  let component: HsemanagerDashboard;
  let fixture: ComponentFixture<HsemanagerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HsemanagerDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HsemanagerDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
