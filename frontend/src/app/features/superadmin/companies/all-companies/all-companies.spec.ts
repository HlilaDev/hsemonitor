import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllCompanies } from './all-companies';

describe('AllCompanies', () => {
  let component: AllCompanies;
  let fixture: ComponentFixture<AllCompanies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllCompanies]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllCompanies);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
