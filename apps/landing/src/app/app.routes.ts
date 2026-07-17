import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/coming-soon/coming-soon').then((m) => m.ComingSoon),
  },
  {
    // Full marketing site — kept reachable while the public sees the coming-soon splash.
    path: 'preview',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
  { path: '**', redirectTo: '' },
];
