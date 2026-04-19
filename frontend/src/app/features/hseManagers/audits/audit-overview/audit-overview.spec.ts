import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditOverview } from './audit-overview';

describe('AuditOverview', () => {
  let component: AuditOverview;
  let fixture: ComponentFixture<AuditOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
