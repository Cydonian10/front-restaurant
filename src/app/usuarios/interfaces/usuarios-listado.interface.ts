import { UsuarioListado } from './usuario-listado.interface';

export interface UsuariosListado {
  items: UsuarioListado[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
