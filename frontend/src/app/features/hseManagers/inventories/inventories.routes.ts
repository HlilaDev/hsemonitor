import { Routes } from '@angular/router';

export const INVENTORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./inventories-overview/inventories-overview')
        .then(m => m.InventoriesOverview),
  },
    {
    path: 'add',
    loadComponent: () =>
      import('./add-inventory/add-inventory')
        .then(m => m.AddInventory),
  },
      {
    path: 'edit/:id',
    loadComponent: () =>
      import('./edit-inventory/edit-inventory')
        .then(m => m.EditInventory),
  },
   {
    path: ':id',
    loadComponent: () =>
      import('./inventory-item/inventory-item')
        .then(m => m.InventoryItem),
  },

];