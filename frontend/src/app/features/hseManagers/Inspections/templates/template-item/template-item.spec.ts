import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateItem } from './template-item';

describe('TemplateItem', () => {
  let component: TemplateItem;
  let fixture: ComponentFixture<TemplateItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
