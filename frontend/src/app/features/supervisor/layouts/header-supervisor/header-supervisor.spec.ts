import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderSupervisor } from './header-supervisor';

describe('HeaderSupervisor', () => {
  let component: HeaderSupervisor;
  let fixture: ComponentFixture<HeaderSupervisor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderSupervisor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderSupervisor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
