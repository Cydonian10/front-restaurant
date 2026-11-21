import { Component, inject, signal } from '@angular/core';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { form, required, maxLength, pattern } from '@angular/forms/signals';
import { AppFormField } from '../../../shared/components/form-field/form-field';
import { DialogShell } from '../../../shared/components/dialog/dialog';
import { Mesa, MesasService, Zona } from '../../access-data/mesas.service';

type Datos = { tipo: 'zona'; zona?: Zona } | { tipo: 'mesa'; zonaId: string; mesa?: Mesa };

@Component({
  selector: 'app-formulario-mesa-zona',
  imports: [DialogShell, AppFormField],
  templateUrl: './formulario-dialog.html',
})
export class FormularioDialog {
  protected readonly data = inject<Datos>(DIALOG_DATA);
  private readonly ref = inject<DialogRef<boolean>>(DialogRef);
  private readonly servicio = inject(MesasService);
  protected readonly ocupado = signal(false);
  protected readonly intentado = signal(false);
  protected readonly error = signal('');
  protected readonly modelo = signal({
    nombre: this.data.tipo === 'zona' ? (this.data.zona?.name ?? '') : '',
    numero: this.data.tipo === 'mesa' && this.data.mesa ? String(this.data.mesa.number) : '',
    capacidad: this.data.tipo === 'mesa' && this.data.mesa ? String(this.data.mesa.capacity) : '',
  });
  protected readonly formulario = form(this.modelo, (s) => {
    if (this.data.tipo === 'zona') {
      required(s.nombre, { message: 'Ingresa un nombre.' });
      maxLength(s.nombre, 120, { message: 'El nombre no puede superar 120 caracteres.' });
    } else {
      required(s.numero, { message: 'Ingresa un número.' });
      required(s.capacidad, { message: 'Ingresa una capacidad.' });
      pattern(s.numero, /^[1-9]\d*$/, { message: 'Ingresa un número entero positivo.' });
      pattern(s.capacidad, /^[1-9]\d*$/, { message: 'Ingresa una capacidad entera positiva.' });
    }
  });
  protected get titulo() {
    return this.data.tipo === 'zona'
      ? this.data.zona
        ? 'Editar zona'
        : 'Nueva zona'
      : this.data.mesa
        ? 'Editar mesa'
        : 'Nueva mesa';
  }
  protected cerrar() {
    if (!this.ocupado()) this.ref.close(false);
  }
  protected guardar(event: Event) {
    event.preventDefault();
    this.intentado.set(true);
    const v = this.modelo();
    if (this.formulario().invalid() || (this.data.tipo === 'zona' && !v.nombre.trim())) return;
    const peticion =
      this.data.tipo === 'zona'
        ? this.data.zona
          ? this.servicio.editarZona(this.data.zona.id, v.nombre.trim())
          : this.servicio.crearZona(v.nombre.trim())
        : this.data.mesa
          ? this.servicio.editarMesa(this.data.mesa.id, {
              number: Number(v.numero),
              capacity: Number(v.capacidad),
            })
          : this.servicio.crearMesa(this.data.zonaId, Number(v.numero), Number(v.capacidad));
    this.ocupado.set(true);
    this.error.set('');
    peticion.subscribe({
      next: () => this.ref.close(true),
      error: (err: { error?: { message?: unknown } }) => {
        this.ocupado.set(false);
        this.error.set(
          typeof err.error?.message === 'string'
            ? err.error.message
            : 'No se pudo guardar. Inténtalo de nuevo.',
        );
      },
    });
  }
}
