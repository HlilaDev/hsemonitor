import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddIncident } from './add-incident';

describe('AddIncident', () => {
  let component: AddIncident;
  let fixture: ComponentFixture<AddIncident>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddIncident]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddIncident);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
