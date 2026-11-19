import { UserRole } from '../../auth/interfaces/auth-user.interface';

export const USUARIOS_ROLES = {
  ADMIN: 'Administrador',
  COCINA: 'Cocina',
  ATENCION: 'Atención',
  MOZO: 'Mozo',
  CLIENTE: 'Cliente',
} satisfies Record<UserRole, string>;
