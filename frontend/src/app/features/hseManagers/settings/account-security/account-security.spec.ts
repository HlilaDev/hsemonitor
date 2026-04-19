import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountSecurity } from './account-security';

describe('AccountSecurity', () => {
  let component: AccountSecurity;
  let fixture: ComponentFixture<AccountSecurity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountSecurity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountSecurity);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
