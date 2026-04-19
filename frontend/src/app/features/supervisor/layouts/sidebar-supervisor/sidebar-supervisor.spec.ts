import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarSupervisor } from './sidebar-supervisor';

describe('SidebarSupervisor', () => {
  let component: SidebarSupervisor;
  let fixture: ComponentFixture<SidebarSupervisor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarSupervisor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarSupervisor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
