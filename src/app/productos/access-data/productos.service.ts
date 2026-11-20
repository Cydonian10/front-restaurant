import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import type { Producto } from '../interfaces/producto.interface';
import type { ProductoCrear } from '../interfaces/producto-crear.interface';
import type { ProductoDisponibilidad } from '../interfaces/producto-disponibilidad.interface';
import type { ProductoImagen } from '../interfaces/producto-imagen.interface';
import type { ProductosConsulta } from '../interfaces/productos-consulta.interface';
import type { ProductosListado } from '../interfaces/productos-listado.interface';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.api.replace(/\/$/, '')}/products`;

  listado(consulta: () => ProductosConsulta | undefined) {
    return httpResource<ProductosListado>(() => {
      const filtros = consulta();
      if (!filtros) return undefined;
      const params: Record<string, string | number> = {
        page: filtros.page,
        limit: filtros.limit,
      };
      if (filtros.tipo) params['tipo'] = filtros.tipo;
      return { url: `${this.apiUrl}/admin`, params };
    });
  }

  crear(producto: ProductoCrear) {
    const datos = new FormData();
    datos.append('nombre', producto.nombre);
    datos.append('precio', producto.precio);
    datos.append('tipo', producto.tipo);
    if (producto.descripcion?.trim()) datos.append('descripcion', producto.descripcion);
    if (producto.imagen) datos.append('imagen', producto.imagen);
    return this.http.post<Producto>(this.apiUrl, datos);
  }

  agregarImagen(id: string, imagen: File) {
    const datos = new FormData();
    datos.append('imagen', imagen);
    return this.http.post<ProductoImagen>(`${this.apiUrl}/${encodeURIComponent(id)}/imagen`, datos);
  }

  cambiarDisponibilidad(id: string, disponible: boolean) {
    return this.http.patch<ProductoDisponibilidad>(
      `${this.apiUrl}/${encodeURIComponent(id)}/disponibilidad`,
      { disponible },
    );
  }
}
