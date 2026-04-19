import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HsemanagerLayout } from './hsemanager-layout';

describe('HsemanagerLayout', () => {
  let component: HsemanagerLayout;
  let fixture: ComponentFixture<HsemanagerLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HsemanagerLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HsemanagerLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
