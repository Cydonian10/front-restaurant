import type { ProductoTipo } from './producto-tipo.type';

export interface ProductosConsulta {
  page: number;
  limit: number;
  tipo?: ProductoTipo;
}
