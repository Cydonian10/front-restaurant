import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { form, maxLength, pattern, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { LucideArchive, LucideEye, LucideEyeOff, LucidePencil, LucidePlus } from '@lucide/angular';
import { ProfileStore } from '../../../auth/stores/profile.store';
import { AppFormField } from '../../../shared/components/form-field/form-field';
import { FormTextarea } from '../../../shared/components/form-textarea/form-textarea';
import { FormSelect } from '../../../shared/components/form-select/form-select';
import { FileDropzone } from '../../../shared/components/file-dropzone/file-dropzone';
import { Paginador } from '../../../shared/components/paginador/paginador';
import { ProductosService } from '../../access-data/productos.service';
import type { Producto } from '../../interfaces/producto.interface';
import { PRODUCTO_TIPOS, type ProductoTipo } from '../../interfaces/producto-tipo.type';

@Component({
  selector: 'app-productos',
  imports: [
    AppFormField,
    FormTextarea,
    FormSelect,
    CurrencyPipe,
    Paginador,
    FileDropzone,
    RouterLink,
    LucidePlus,
    LucidePencil,
    LucideEye,
    LucideEyeOff,
    LucideArchive,
  ],
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class Productos {
  private readonly router = inject(Router);
  private readonly profile = inject(ProfileStore);
  private readonly service = inject(ProductosService);
  protected readonly isAdmin = computed(() => this.profile.profile()?.role === 'ADMIN');
  protected readonly tipos = PRODUCTO_TIPOS;
  protected readonly tipo = signal<ProductoTipo | ''>('');
  protected readonly page = linkedSignal(() => {
    this.tipo();
    return 1;
  });
  protected readonly productos = this.service.listado(() => {
    if (!this.isAdmin()) return undefined;
    const tipo = this.tipo();
    return { page: this.page(), limit: 10, ...(tipo ? { tipo } : {}) };
  });
  protected readonly listado = computed(() =>
    this.productos.hasValue() ? this.productos.value() : undefined,
  );
  protected readonly forbidden = computed(
    () =>
      !this.isAdmin() ||
      (this.productos.error() instanceof HttpErrorResponse &&
        (this.productos.error() as HttpErrorResponse).status === 403),
  );
  protected readonly totalPages = linkedSignal({
    source: () => ({ tipo: this.tipo(), listado: this.listado() }),
    computation: ({ tipo, listado }, previous): number =>
      listado?.totalPages ?? (previous?.source.tipo === tipo ? previous.value : 0),
  });
  protected readonly ocupado = signal<string | null>(null);
  protected readonly mensaje = signal(
    (this.router.getCurrentNavigation()?.extras.state?.['mensaje'] as string) ?? '',
  );
  protected readonly editando = signal<Producto | null>(null);
  protected readonly edicion = signal({
    nombre: '',
    descripcion: '',
    precio: '',
    tipo: 'PLATO_FONDO' as ProductoTipo,
  });
  protected readonly formularioEdicion = form(this.edicion, (schema) => {
    required(schema.nombre, { message: 'Ingresa un nombre.' });
    maxLength(schema.nombre, 255, { message: 'El nombre no puede superar 255 caracteres.' });
    required(schema.precio, { message: 'Ingresa un precio.' });
    pattern(schema.precio, /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/, { message: 'Ingresa un precio válido con hasta dos decimales.' });
  });
  protected readonly intentado = signal(false);
  protected readonly imagenEdicion = signal<File | undefined>(undefined);
  protected readonly error = signal('');
  protected etiqueta(tipo: ProductoTipo): string {
    return this.tipos.find((t) => t.value === tipo)?.label ?? tipo;
  }
  private imagenValida(file: File | undefined): boolean {
    return (
      !file ||
      (['image/jpeg', 'image/png', 'image/webp'].includes(file.type) &&
        file.size <= 5 * 1024 * 1024)
    );
  }
  private errorOperacion(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 409) return 'El producto ya tiene una imagen. Actualiza el listado.';
      if (error.status === 403) return 'No tienes permiso para realizar esta operación.';
      if (error.status === 404) return 'El producto ya no está disponible. Actualiza el listado.';
      if (error.status === 400 || error.status === 413)
        return 'Los datos o la imagen no son válidos. Revísalos e inténtalo de nuevo.';
    }
    return 'No se pudo completar la operación. Inténtalo de nuevo.';
  }
  protected iniciarEdicion(producto: Producto): void {
    this.editando.set(producto);
    this.edicion.set({
      nombre: producto.nombre,
      descripcion: producto.descripcion ?? '',
      precio: producto.precio,
      tipo: producto.tipo,
    });
    this.imagenEdicion.set(undefined);
    this.intentado.set(false);
    this.error.set('');
    this.mensaje.set('');
  }
  protected guardarEdicion(): void {
    const producto = this.editando();
    const data = this.edicion();
    const imagen = this.imagenEdicion();
    if (!producto || !this.isAdmin() || this.ocupado()) return;
    this.intentado.set(true);
    const nombre = data.nombre.trim();
    if (
      !nombre ||
      nombre.length > 255 ||
      !/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(data.precio) ||
      !this.imagenValida(imagen)
    ) {
      this.error.set(
        'Ingresa un nombre válido, un precio válido y una imagen JPG, PNG o WebP de hasta 5 MB.',
      );
      return;
    }
    this.error.set('');
    this.ocupado.set(producto.id);
    this.service
      .editar(producto.id, {
        ...data,
        nombre,
        descripcion: data.descripcion.trim() || undefined,
        imagen,
      })
      .subscribe({
        next: () => {
          this.ocupado.set(null);
          this.editando.set(null);
          this.mensaje.set('Producto actualizado correctamente.');
          this.productos.reload();
        },
        error: (err: unknown) => {
          this.ocupado.set(null);
          this.error.set(this.errorOperacion(err));
        },
      });
  }
  protected eliminar(producto: Producto): void {
    if (
      !this.isAdmin() ||
      this.ocupado() ||
      !globalThis.confirm(`¿Dar de baja el producto “${producto.nombre}”?`)
    )
      return;
    this.error.set('');
    this.mensaje.set('');
    this.ocupado.set(producto.id);
    this.service.eliminar(producto.id).subscribe({
      next: () => {
        this.ocupado.set(null);
        this.editando.set(null);
        this.mensaje.set('Producto dado de baja.');
        if (this.listado()?.items.length === 1 && this.page() > 1) this.page.update((p) => p - 1);
        else this.productos.reload();
      },
      error: (err: unknown) => {
        this.ocupado.set(null);
        this.error.set(this.errorOperacion(err));
      },
    });
  }
  protected disponibilidad(producto: Producto): void {
    if (!this.isAdmin() || this.ocupado()) return;
    this.error.set('');
    this.mensaje.set('');
    this.ocupado.set(producto.id);
    this.service.cambiarDisponibilidad(producto.id, !producto.disponible).subscribe({
      next: () => {
        this.ocupado.set(null);
        this.mensaje.set('Disponibilidad actualizada.');
        this.productos.reload();
      },
      error: (err: unknown) => {
        this.ocupado.set(null);
        this.error.set(this.errorOperacion(err));
      },
    });
  }
  protected subirImagen(producto: Producto, file: File | undefined): void {
    if (!file || !this.isAdmin() || this.ocupado()) return;
    if (!this.imagenValida(file)) {
      this.error.set('Selecciona una imagen JPG, PNG o WebP de hasta 5 MB.');
      return;
    }
    this.error.set('');
    this.mensaje.set('');
    this.ocupado.set(producto.id);
    this.service.agregarImagen(producto.id, file).subscribe({
      next: () => {
        this.ocupado.set(null);
        this.mensaje.set('Imagen agregada correctamente.');
        this.productos.reload();
      },
      error: (err: unknown) => {
        this.ocupado.set(null);
        this.error.set(this.errorOperacion(err));
      },
    });
  }
}
