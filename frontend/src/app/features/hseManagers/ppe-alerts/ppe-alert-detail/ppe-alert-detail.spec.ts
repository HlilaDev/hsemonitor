import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpeAlertDetail } from './ppe-alert-detail';

describe('PpeAlertDetail', () => {
  let component: PpeAlertDetail;
  let fixture: ComponentFixture<PpeAlertDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PpeAlertDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpeAlertDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
