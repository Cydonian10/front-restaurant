import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { form, maxLength, pattern, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { LucideArrowLeft, LucidePlus } from '@lucide/angular';
import { ProfileStore } from '../../../auth/stores/profile.store';
import { AppFormField } from '../../../shared/components/form-field/form-field';
import { FormTextarea } from '../../../shared/components/form-textarea/form-textarea';
import { FormSelect } from '../../../shared/components/form-select/form-select';
import { FileDropzone } from '../../../shared/components/file-dropzone/file-dropzone';
import { ProductosService } from '../../access-data/productos.service';
import { PRODUCTO_TIPOS, type ProductoTipo } from '../../interfaces/producto-tipo.type';

@Component({
  selector: 'app-crear-producto',
  imports: [
    RouterLink,
    LucideArrowLeft,
    LucidePlus,
    AppFormField,
    FormTextarea,
    FormSelect,
    FileDropzone,
  ],
  templateUrl: './crear-producto.html',
  styleUrl: './crear-producto.css',
})
export class CrearProducto {
  private readonly router = inject(Router);
  private readonly profile = inject(ProfileStore);
  private readonly service = inject(ProductosService);
  protected readonly isAdmin = computed(() => this.profile.profile()?.role === 'ADMIN');
  protected readonly tipos = PRODUCTO_TIPOS;
  protected readonly modelo = signal({
    nombre: '',
    descripcion: '',
    precio: '',
    tipo: 'PLATO_FONDO' as ProductoTipo,
  });
  protected readonly formulario = form(this.modelo, (schema) => {
    required(schema.nombre, { message: 'Ingresa un nombre.' });
    maxLength(schema.nombre, 255, { message: 'El nombre no puede superar 255 caracteres.' });
    required(schema.precio, { message: 'Ingresa un precio.' });
    pattern(schema.precio, /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/, {
      message: 'Ingresa un precio válido con hasta dos decimales.',
    });
  });
  protected readonly intentado = signal(false);
  protected readonly imagen = signal<File | undefined>(undefined);
  protected readonly guardando = signal(false);
  protected readonly mensaje = signal('');
  protected readonly error = signal('');
  protected crear(event: Event): void {
    event.preventDefault();
    if (!this.isAdmin() || this.guardando()) return;
    this.intentado.set(true);
    const data = this.modelo();
    const nombre = data.nombre.trim();
    const imagen = this.imagen();
    const imagenValida =
      !imagen ||
      (['image/jpeg', 'image/png', 'image/webp'].includes(imagen.type) &&
        imagen.size <= 5 * 1024 * 1024);
    if (
      !nombre ||
      nombre.length > 255 ||
      !/^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(data.precio) ||
      !imagenValida
    ) {
      this.error.set(
        'Ingresa un nombre válido, un precio no negativo con hasta dos decimales y una imagen JPG, PNG o WebP de hasta 5 MB.',
      );
      return;
    }
    this.error.set('');
    this.mensaje.set('');
    this.guardando.set(true);
    this.service
      .crear({ ...data, nombre, descripcion: data.descripcion.trim() || undefined, imagen })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          void this.router.navigate(['/admin/productos'], {
            state: { mensaje: 'Producto creado correctamente.' },
          });
        },
        error: (err: unknown) => {
          this.guardando.set(false);
          this.error.set(
            err instanceof HttpErrorResponse && err.status === 403
              ? 'No tienes permiso para crear productos.'
              : 'No se pudo crear el producto. Revisa los datos e inténtalo de nuevo.',
          );
        },
      });
  }
}
