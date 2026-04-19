import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoriesOverview } from './inventories-overview';

describe('InventoriesOverview', () => {
  let component: InventoriesOverview;
  let fixture: ComponentFixture<InventoriesOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoriesOverview]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InventoriesOverview);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
