import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutSupervisor } from './layout-supervisor';

describe('LayoutSupervisor', () => {
  let component: LayoutSupervisor;
  let fixture: ComponentFixture<LayoutSupervisor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutSupervisor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutSupervisor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
