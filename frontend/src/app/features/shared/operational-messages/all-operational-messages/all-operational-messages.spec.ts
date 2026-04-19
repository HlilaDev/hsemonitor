import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllOperationalMessages } from './all-operational-messages';

describe('AllOperationalMessages', () => {
  let component: AllOperationalMessages;
  let fixture: ComponentFixture<AllOperationalMessages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllOperationalMessages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllOperationalMessages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
