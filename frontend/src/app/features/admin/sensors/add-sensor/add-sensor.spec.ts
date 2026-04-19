import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSensor } from './add-sensor';

describe('AddSensor', () => {
  let component: AddSensor;
  let fixture: ComponentFixture<AddSensor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSensor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSensor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
