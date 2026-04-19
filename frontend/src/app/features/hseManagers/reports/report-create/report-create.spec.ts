import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCreate } from './report-create';

describe('ReportCreate', () => {
  let component: ReportCreate;
  let fixture: ComponentFixture<ReportCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCreate]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
