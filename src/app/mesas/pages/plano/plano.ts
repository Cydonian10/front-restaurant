import { form, required, pattern, maxLength } from '@angular/forms/signals';
import { AppFormField } from '../../../shared/components/form-field/form-field';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Component, inject, signal } from '@angular/core';
import { ProfileStore } from '../../../auth/stores/profile.store';
import { MesasService, Zona, Mesa } from '../../access-data/mesas.service';

@Component({
  selector: 'app-plano',
  imports: [AppFormField],
  templateUrl: './plano.html',
  styleUrl: './plano.css',
})
export class Plano {
  private readonly service = inject(MesasService);
  protected readonly profile = inject(ProfileStore);
  protected readonly zonas = signal<Zona[]>([]);
  protected readonly seleccion = signal<string | null>(null);
  protected readonly estado = signal<'cargando' | 'listo' | 'error'>('cargando');
  protected readonly ocupado = signal(false);
  protected readonly errorOperacion = signal('');
  protected readonly mensaje = signal('');
  protected zonaFormulario: { id?: string; name: string } | null = null;
  protected mesaFormulario: {
    id?: string;
    zoneId: string;
    number: number | null;
    capacity: number | null;
  } | null = null;
  protected readonly zonaModelo = signal({ name: '' });
  protected readonly mesaModelo = signal({ number: '', capacity: '' });
  protected readonly zonaForm = form(this.zonaModelo, (s) => {
    required(s.name, { message: 'Ingresa un nombre.' });
    maxLength(s.name, 120);
  });
  protected readonly mesaForm = form(this.mesaModelo, (s) => {
    required(s.number);
    required(s.capacity);
    pattern(s.number, /^[1-9]\d*$/, { message: 'Ingresa un número entero positivo.' });
    pattern(s.capacity, /^[1-9]\d*$/, { message: 'Ingresa una capacidad entera positiva.' });
  });
  protected readonly intentado = signal(false);
  protected abrirZona(zona?: Zona) {
    this.zonaFormulario = { id: zona?.id, name: zona?.name ?? '' };
    this.zonaModelo.set({ name: zona?.name ?? '' });
    this.mesaFormulario = null;
    this.intentado.set(false);
  }
  protected abrirMesa(zonaId: string, mesa?: Mesa) {
    this.mesaFormulario = {
      id: mesa?.id,
      zoneId: zonaId,
      number: mesa?.number ?? null,
      capacity: mesa?.capacity ?? null,
    };
    this.mesaModelo.set({
      number: mesa ? String(mesa.number) : '',
      capacity: mesa ? String(mesa.capacity) : '',
    });
    this.zonaFormulario = null;
    this.intentado.set(false);
  }
  protected readonly mesaSeleccionada = signal<Mesa | null>(null);
  protected get esAdmin() {
    return this.profile.profile()?.role === 'ADMIN';
  }
  protected operar(request: Observable<unknown>, mensaje: string) {
    this.ocupado.set(true);
    this.errorOperacion.set('');
    this.mensaje.set('');
    request.subscribe({
      next: () => {
        this.ocupado.set(false);
        this.zonaFormulario = null;
        this.mesaFormulario = null;
        this.mesaSeleccionada.set(null);
        this.mensaje.set(mensaje);
        this.cargar();
      },
      error: (error: HttpErrorResponse) => {
        this.ocupado.set(false);
        this.errorOperacion.set(
          typeof error.error?.message === 'string'
            ? error.error.message
            : 'No se pudo guardar el cambio. Inténtalo de nuevo.',
        );
      },
    });
  }
  protected guardarZona() {
    const f = this.zonaFormulario;
    this.intentado.set(true);
    if (!f || this.zonaForm().invalid() || !this.zonaModelo().name.trim()) return;
    f.name = this.zonaModelo().name;
    this.operar(
      f.id ? this.service.editarZona(f.id, f.name.trim()) : this.service.crearZona(f.name.trim()),
      'Zona guardada.',
    );
  }
  protected guardarMesa() {
    const f = this.mesaFormulario;
    this.intentado.set(true);
    if (!f || this.mesaForm().invalid()) return;
    f.number = Number(this.mesaModelo().number);
    f.capacity = Number(this.mesaModelo().capacity);
    if (
      !f ||
      !f.number ||
      !f.capacity ||
      !Number.isInteger(f.number) ||
      !Number.isInteger(f.capacity) ||
      f.number < 1 ||
      f.capacity < 1
    )
      return;
    this.operar(
      f.id
        ? this.service.editarMesa(f.id, { number: f.number, capacity: f.capacity })
        : this.service.crearMesa(f.zoneId, f.number, f.capacity),
      'Mesa guardada.',
    );
  }
  protected eliminarZona(zona: Zona) {
    if (confirm(`¿Desactivar la zona ${zona.name}?`))
      this.operar(this.service.eliminarZona(zona.id), 'Zona desactivada.');
  }
  protected eliminarMesa(mesa: Mesa) {
    if (confirm(`¿Desactivar la mesa ${mesa.number}?`))
      this.operar(this.service.eliminarMesa(mesa.id), 'Mesa desactivada.');
  }
  protected disponibilidad(mesa: Mesa) {
    this.operar(
      this.service.editarMesa(mesa.id, { outOfService: mesa.status !== 'OUT_OF_SERVICE' }),
      'Disponibilidad actualizada.',
    );
  }
  protected get autorizado() {
    return ['ADMIN', 'MOZO', 'COCINA'].includes(this.profile.profile()?.role ?? '');
  }
  constructor() {
    if (this.autorizado) this.cargar();
  }
  protected cargar() {
    this.estado.set('cargando');
    this.service.listar().subscribe({
      next: (zonas) => {
        this.zonas.set(zonas);
        this.seleccion.set(
          zonas.some((zona) => zona.id === this.seleccion())
            ? this.seleccion()
            : (zonas[0]?.id ?? null),
        );
        this.estado.set('listo');
      },
      error: () => this.estado.set('error'),
    });
  }
  protected ancho(zona: Zona) {
    return Math.max(900, ...zona.tables.map((mesa) => mesa.positionX + 130));
  }
  protected alto(zona: Zona) {
    return Math.max(420, ...zona.tables.map((mesa) => mesa.positionY + 110));
  }
  protected etiqueta(estado: string) {
    return estado === 'OCCUPIED'
      ? 'Ocupada'
      : estado === 'OUT_OF_SERVICE'
        ? 'Fuera de servicio'
        : 'Disponible';
  }
}
