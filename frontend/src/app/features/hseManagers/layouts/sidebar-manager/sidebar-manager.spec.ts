import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarManager } from './sidebar-manager';

describe('SidebarManager', () => {
  let component: SidebarManager;
  let fixture: ComponentFixture<SidebarManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
