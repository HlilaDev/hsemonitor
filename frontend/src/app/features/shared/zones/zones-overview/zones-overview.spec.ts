import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZonesOverview } from './zones-overview';

describe('ZonesOverview', () => {
  let component: ZonesOverview;
  let fixture: ComponentFixture<ZonesOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZonesOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZonesOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
