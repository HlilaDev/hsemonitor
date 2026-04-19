import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoneDetails } from './zone-details';

describe('ZoneDetails', () => {
  let component: ZoneDetails;
  let fixture: ComponentFixture<ZoneDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoneDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ZoneDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
