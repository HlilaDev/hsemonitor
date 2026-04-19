import { Routes } from '@angular/router';

export const COMPANIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./all-companies/all-companies')
        .then(m => m.AllCompanies),
  },

    {
    path: 'add',
    loadComponent: () =>
      import('./add-company/add-company')
        .then(m => m.AddCompany),
  },

      {
    path: ':id',
    loadComponent: () =>
      import('./company-details/company-details')
        .then(m => m.CompanyDetails),
  },
 

];