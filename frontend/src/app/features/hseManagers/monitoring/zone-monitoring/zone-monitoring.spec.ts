import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneMonitoring } from './zone-monitoring';

describe('ZoneMonitoring', () => {
  let component: ZoneMonitoring;
  let fixture: ComponentFixture<ZoneMonitoring>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoneMonitoring]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZoneMonitoring);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
