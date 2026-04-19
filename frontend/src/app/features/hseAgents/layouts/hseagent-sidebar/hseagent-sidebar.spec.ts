import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HseagentSidebar } from './hseagent-sidebar';

describe('HseagentSidebar', () => {
  let component: HseagentSidebar;
  let fixture: ComponentFixture<HseagentSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HseagentSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HseagentSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
