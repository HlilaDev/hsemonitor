import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSensor } from './edit-sensor';

describe('EditSensor', () => {
  let component: EditSensor;
  let fixture: ComponentFixture<EditSensor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSensor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSensor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
