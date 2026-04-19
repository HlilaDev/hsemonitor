import { Routes } from '@angular/router';

export const EMPLOYEES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./all-employees/all-employees')
        .then(m => m.AllEmployees),
  },
  {
    path: 'add',
    loadComponent: () =>
      import('./add-employee/add-employee')
        .then(m => m.AddEmployee),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./edit-employee/edit-employee')
        .then(m => m.EditEmployee),
  },
    {
    path: ':id',
    loadComponent: () =>
      import('./employee-profile/employee-profile')
        .then(m => m.EmployeeProfile),
  },
];