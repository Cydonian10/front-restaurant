import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'auth', loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes) },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin-layout').then((m) => m.AdminLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./admin/admin-home').then((m) => m.AdminHome),
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./usuarios/usuarios.routes').then((r) => r.USUARIOS_ROUTE),
      },
    ],
  },
];
