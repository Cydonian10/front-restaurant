import { UserRole } from '../../auth/interfaces/auth-user.interface';
import { UsuariosLimite } from './usuarios-limite.type';
import { UsuariosVerificacion } from './usuarios-verificacion.type';

export interface UsuariosConsulta {
  page: number;
  limit: UsuariosLimite;
  search: string;
  role: UserRole | '';
  emailVerified: UsuariosVerificacion;
}
