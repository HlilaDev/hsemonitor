import { Routes } from '@angular/router';

export const EMPLOYEES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./all-employees/all-employees')
        .then(m => m.AllEmployees),
  },
 

];