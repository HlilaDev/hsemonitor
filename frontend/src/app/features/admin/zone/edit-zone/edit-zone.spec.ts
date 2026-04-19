import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditZone } from './edit-zone';

describe('EditZone', () => {
  let component: EditZone;
  let fixture: ComponentFixture<EditZone>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditZone]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditZone);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
