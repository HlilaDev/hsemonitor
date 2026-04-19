import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateDetails } from './template-details';

describe('TemplateDetails', () => {
  let component: TemplateDetails;
  let fixture: ComponentFixture<TemplateDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
