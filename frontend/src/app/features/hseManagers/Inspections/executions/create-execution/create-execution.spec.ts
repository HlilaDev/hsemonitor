import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateExecution } from './create-execution';

describe('CreateExecution', () => {
  let component: CreateExecution;
  let fixture: ComponentFixture<CreateExecution>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateExecution]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateExecution);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
