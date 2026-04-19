import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderAgent } from './header-agent';

describe('HeaderAgent', () => {
  let component: HeaderAgent;
  let fixture: ComponentFixture<HeaderAgent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderAgent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderAgent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
