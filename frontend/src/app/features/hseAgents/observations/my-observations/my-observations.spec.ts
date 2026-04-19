import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyObservations } from './my-observations';

describe('MyObservations', () => {
  let component: MyObservations;
  let fixture: ComponentFixture<MyObservations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyObservations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyObservations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
