import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportEdit } from './report-edit';

describe('ReportEdit', () => {
  let component: ReportEdit;
  let fixture: ComponentFixture<ReportEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
