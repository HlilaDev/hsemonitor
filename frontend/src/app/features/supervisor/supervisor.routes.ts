import { Routes } from '@angular/router';

export const SUPERVISOR_ROUTES: Routes = [
 {
    path: '',
     
    loadComponent: () =>
      import('./layouts/layout-supervisor/layout-supervisor')
        .then(m => m.LayoutSupervisor), // ✅ shell with <router-outlet>
    children: [

      

    ]

  }


];