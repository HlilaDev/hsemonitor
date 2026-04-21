import { Routes } from '@angular/router';


export const GUEST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home-page/home-page').then(m => m.HomePage),
    
  },

    {
    path: 'contact-us',
    loadComponent: () =>
      import('./contact-us/contact-us').then(m => m.ContactUs),
    
  },
  
];