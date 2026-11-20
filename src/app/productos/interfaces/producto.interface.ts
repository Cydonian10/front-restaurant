import type { ProductoTipo } from './producto-tipo.type';

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  tipo: ProductoTipo;
  principal: boolean;
  disponible: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
