import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllZones } from './all-zones';

describe('AllZones', () => {
  let component: AllZones;
  let fixture: ComponentFixture<AllZones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllZones]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllZones);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
