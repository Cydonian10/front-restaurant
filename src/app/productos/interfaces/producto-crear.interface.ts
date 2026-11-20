import type { ProductoTipo } from './producto-tipo.type';

export interface ProductoCrear {
  nombre: string;
  precio: string;
  tipo: ProductoTipo;
  descripcion?: string;
  imagen?: File;
}
