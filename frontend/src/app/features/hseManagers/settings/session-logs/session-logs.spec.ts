import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionLogs } from './session-logs';

describe('SessionLogs', () => {
  let component: SessionLogs;
  let fixture: ComponentFixture<SessionLogs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionLogs]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SessionLogs);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
