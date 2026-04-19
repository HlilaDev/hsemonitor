import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OperationalMessageDetail } from './operational-message-detail';

describe('OperationalMessageDetail', () => {
  let component: OperationalMessageDetail;
  let fixture: ComponentFixture<OperationalMessageDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OperationalMessageDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OperationalMessageDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
