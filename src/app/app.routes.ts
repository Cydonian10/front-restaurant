import { authGuard } from './auth/access-control/auth.guard';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },
  { path: 'auth', loadChildren: () => import('./auth/auth.routes').then((m) => m.authRoutes) },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/layouts/admin/admin-layout').then((m) => m.AdminLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./admin/pages/home/admin-home').then((m) => m.AdminHome),
      },
      {
        path: 'productos',
        loadComponent: () => import('./productos/pages/productos/productos').then((m) => m.Productos),
      },
      {
        path: 'productos/nuevo',
        loadComponent: () => import('./productos/pages/crear-producto/crear-producto').then((m) => m.CrearProducto),
      },
      {
        path: 'usuarios',
        loadChildren: () => import('./usuarios/usuarios.routes').then((r) => r.USUARIOS_ROUTE),
      },
    ],
  },
];
