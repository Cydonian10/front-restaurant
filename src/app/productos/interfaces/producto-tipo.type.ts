export type ProductoTipo = 'BEBIDA' | 'EXTRA' | 'PLATO_FONDO' | 'POSTRE' | 'MENU' | 'BEBIDA_MENU';

export const PRODUCTO_TIPOS: { value: ProductoTipo; label: string }[] = [
  { value: 'PLATO_FONDO', label: 'Platos de fondo' },
  { value: 'BEBIDA', label: 'Bebidas' },
  { value: 'EXTRA', label: 'Extras' },
  { value: 'POSTRE', label: 'Postres' },
  { value: 'MENU', label: 'Menús' },
  { value: 'BEBIDA_MENU', label: 'Bebidas de menú' },
];
