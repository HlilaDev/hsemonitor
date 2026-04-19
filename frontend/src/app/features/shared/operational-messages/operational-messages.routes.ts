import { Routes } from '@angular/router';

export const OPERATIONAL_MESSAGES_ROUTES: Routes = [
  {
    path: '',
   
    loadComponent: () =>
      import('./all-operational-messages/all-operational-messages')
        .then(m => m.AllOperationalMessages),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./add-operational-message/add-operational-message')
        .then(m => m.AddOperationalMessage),
  },
    {
    path: ':id',
    loadComponent: () =>
      import('./operational-message-detail/operational-message-detail')
        .then(m => m.OperationalMessageDetail),
  },
];