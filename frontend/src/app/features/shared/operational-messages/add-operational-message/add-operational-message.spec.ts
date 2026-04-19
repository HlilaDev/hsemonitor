import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddOperationalMessage } from './add-operational-message';

describe('AddOperationalMessage', () => {
  let component: AddOperationalMessage;
  let fixture: ComponentFixture<AddOperationalMessage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddOperationalMessage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddOperationalMessage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
