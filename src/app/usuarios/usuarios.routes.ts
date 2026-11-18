import { Routes } from '@angular/router';

// aqui la ruta para nmi usuarios
export const USUARIOS_ROUTE: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/usuarios/usuarios.page').then((m) => m.UsuariosPage),
  },
];
