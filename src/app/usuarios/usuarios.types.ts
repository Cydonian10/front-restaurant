import { UserRole } from '../auth/interfaces/auth-user.interface';

export const USUARIOS_ROLES = {
  ADMIN: 'Administrador',
  COCINA: 'Cocina',
  ATENCION: 'Atención',
  MOZO: 'Mozo',
  CLIENTE: 'Cliente',
} satisfies Record<UserRole, string>;

export const USUARIOS_LIMITES = [10, 25, 50, 100] as const;
export type UsuariosLimite = (typeof USUARIOS_LIMITES)[number];
export type UsuariosVerificacion = '' | 'true' | 'false';

export interface UsuarioListado {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  person: {
    name: string;
    lastName: string | null;
    phone: string | null;
  } | null;
}

export interface UsuariosListado {
  items: UsuarioListado[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
