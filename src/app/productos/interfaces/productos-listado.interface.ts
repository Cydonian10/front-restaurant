import type { Producto } from './producto.interface';

export interface ProductosListado {
  items: Producto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
