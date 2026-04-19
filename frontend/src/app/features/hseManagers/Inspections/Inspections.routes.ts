import { Routes } from '@angular/router';

export const INSPECTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./inspections-overview/inspections-overview')
        .then(m => m.InspectionsOverview),
  },
    {
    path: 'list',
    loadComponent: () =>
      import('./inspection-list/inspection-list')
        .then(m => m.InspectionList),
  },
  {
    path: 'templates/new',
    loadComponent: () =>
      import('./create-template/create-template')
        .then(m => m.CreateTemplate),
  },
  {
    path: 'templates',
    loadComponent: () =>
      import('./templates/templates-list/templates-list')
        .then(m => m.TemplatesList),
  },
  {
    path: 'templates/:id',
    loadComponent: () =>
      import('./templates/template-details/template-details')
        .then(m => m.TemplateDetails),
  },
    {
    path: 'executions/new',
    loadComponent: () =>
      import('./executions/create-execution/create-execution')
        .then(m => m.CreateExecution),
  },
      {
    path: ':id',
    loadComponent: () =>
      import('./inspection-details/inspection-details')
        .then(m => m.InspectionDetails),
  },
];