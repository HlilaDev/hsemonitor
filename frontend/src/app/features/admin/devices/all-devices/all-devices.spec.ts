import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllDevices } from './all-devices';

describe('AllDevices', () => {
  let component: AllDevices;
  let fixture: ComponentFixture<AllDevices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllDevices]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllDevices);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
