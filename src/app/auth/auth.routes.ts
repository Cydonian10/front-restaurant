import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'callback',
    loadComponent: () =>
      import('./pages/google-callback/google-callback.page').then((m) => m.GoogleCallbackPage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
];
