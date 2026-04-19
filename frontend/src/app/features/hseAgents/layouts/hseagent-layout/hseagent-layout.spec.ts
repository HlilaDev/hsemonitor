import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HseagentLayout } from './hseagent-layout';

describe('HseagentLayout', () => {
  let component: HseagentLayout;
  let fixture: ComponentFixture<HseagentLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HseagentLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HseagentLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
