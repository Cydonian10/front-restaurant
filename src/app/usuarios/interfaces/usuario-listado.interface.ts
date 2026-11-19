import { UserRole } from '../../auth/interfaces/auth-user.interface';

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
