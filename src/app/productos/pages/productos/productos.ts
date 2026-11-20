import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucidePlus } from '@lucide/angular';
import { ProfileStore } from '../../../auth/stores/profile.store';
import { FileDropzone } from '../../../shared/components/file-dropzone/file-dropzone';
import { Paginador } from '../../../shared/components/paginador/paginador';
import { ProductosService } from '../../access-data/productos.service';
import type { Producto } from '../../interfaces/producto.interface';
import type { ProductoTipo } from '../../interfaces/producto-tipo.type';

@Component({ selector: 'app-productos', imports: [CurrencyPipe, Paginador, FileDropzone, RouterLink, LucidePlus], templateUrl: './productos.html', styleUrl: './productos.css' })
export class Productos {
  private readonly profile = inject(ProfileStore);
  private readonly service = inject(ProductosService);
  protected readonly isAdmin = computed(() => this.profile.profile()?.role === 'ADMIN');
  protected readonly tipos: { value: ProductoTipo; label: string }[] = [
    { value: 'PLATO_FONDO', label: 'Platos de fondo' }, { value: 'BEBIDA', label: 'Bebidas' },
    { value: 'EXTRA', label: 'Extras' }, { value: 'POSTRE', label: 'Postres' },
  ];
  protected readonly tipo = signal<ProductoTipo | ''>('');
  protected readonly page = linkedSignal(() => { this.tipo(); return 1; });
  protected readonly productos = this.service.listado(() => {
    if (!this.isAdmin()) return undefined;
    const tipo = this.tipo();
    return { page: this.page(), limit: 10, ...(tipo ? { tipo } : {}) };
  });
  protected readonly listado = computed(() => this.productos.hasValue() ? this.productos.value() : undefined);
  protected readonly forbidden = computed(() => !this.isAdmin() || (this.productos.error() instanceof HttpErrorResponse && (this.productos.error() as HttpErrorResponse).status === 403));
  protected readonly totalPages = linkedSignal({ source: () => ({ tipo: this.tipo(), listado: this.listado() }), computation: ({ tipo, listado }, previous): number => listado?.totalPages ?? (previous?.source.tipo === tipo ? previous.value : 0) });
  protected readonly ocupado = signal<string | null>(null);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');
  protected etiqueta(tipo: ProductoTipo): string { return this.tipos.find(t => t.value === tipo)?.label ?? tipo; }
  private imagenValida(file: File | undefined): boolean { return !file || (['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 5 * 1024 * 1024); }
  private errorOperacion(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 409) return 'El producto ya tiene una imagen. Actualiza el listado.';
      if (error.status === 403) return 'No tienes permiso para realizar esta operación.';
      if (error.status === 400 || error.status === 413) return 'Los datos o la imagen no son válidos. Revísalos e inténtalo de nuevo.';
    }
    return 'No se pudo completar la operación. Inténtalo de nuevo.';
  }
  protected disponibilidad(producto: Producto): void {
    if (!this.isAdmin() || this.ocupado()) return;
    this.error.set(''); this.mensaje.set(''); this.ocupado.set(producto.id);
    this.service.cambiarDisponibilidad(producto.id, !producto.disponible).subscribe({
      next: () => { this.ocupado.set(null); this.mensaje.set('Disponibilidad actualizada.'); this.productos.reload(); },
      error: (err: unknown) => { this.ocupado.set(null); this.error.set(this.errorOperacion(err)); },
    });
  }
  protected subirImagen(producto: Producto, file: File | undefined): void {
    if (!file || !this.isAdmin() || this.ocupado()) return;
    if (!this.imagenValida(file)) { this.error.set('Selecciona una imagen JPG, PNG o WebP de hasta 5 MB.'); return; }
    this.error.set(''); this.mensaje.set(''); this.ocupado.set(producto.id);
    this.service.agregarImagen(producto.id, file).subscribe({
      next: () => { this.ocupado.set(null); this.mensaje.set('Imagen agregada correctamente.'); this.productos.reload(); },
      error: (err: unknown) => { this.ocupado.set(null); this.error.set(this.errorOperacion(err)); },
    });
  }
}
