import { Routes } from '@angular/router';

export const TEAM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./team-overview/team-overview')
        .then(m => m.TeamOverview),
  },
    
  

];