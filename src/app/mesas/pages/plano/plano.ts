import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Component, computed, inject, signal } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { FormularioDialog } from '../../components/formulario-dialog/formulario-dialog';
import { ConfirmDialog } from '../../../shared/components/confirm-dialog/confirm-dialog';
import { ProfileStore } from '../../../auth/stores/profile.store';
import { MesasService, Zona, Mesa } from '../../access-data/mesas.service';

@Component({
  selector: 'app-plano',
  templateUrl: './plano.html',
  styleUrl: './plano.css',
})
export class Plano {
  private readonly dialog = inject(Dialog);
  protected readonly resumen = computed(() => {
    const mesas = this.zonas().flatMap((z) => z.tables);
    return {
      total: mesas.length,
      disponibles: mesas.filter((m) => m.status === 'AVAILABLE').length,
      ocupadas: mesas.filter((m) => m.status === 'OCCUPIED').length,
      fuera: mesas.filter((m) => m.status === 'OUT_OF_SERVICE').length,
    };
  });
  private readonly service = inject(MesasService);
  protected readonly profile = inject(ProfileStore);
  protected readonly zonas = signal<Zona[]>([]);
  protected readonly seleccion = signal<string | null>(null);
  protected readonly estado = signal<'cargando' | 'listo' | 'error'>('cargando');
  protected readonly ocupado = signal(false);
  protected readonly errorOperacion = signal('');
  protected readonly mensaje = signal('');
  protected abrirZona(zona?: Zona) {
    this.abrirFormulario({ tipo: 'zona', zona }, zona ? 'Editar zona' : 'Nueva zona');
  }
  protected abrirMesa(zonaId: string, mesa?: Mesa) {
    this.abrirFormulario({ tipo: 'mesa', zonaId, mesa }, mesa ? 'Editar mesa' : 'Nueva mesa');
  }
  private abrirFormulario(
    data: { tipo: 'zona'; zona?: Zona } | { tipo: 'mesa'; zonaId: string; mesa?: Mesa },
    title: string,
  ) {
    this.dialog
      .open<boolean>(FormularioDialog, {
        data,
        ariaLabel: title,
        width: '480px',
        maxWidth: 'calc(100vw - 32px)',
        panelClass: 'app-dialog-panel',
        backdropClass: 'app-dialog-backdrop',
        disableClose: true,
        autoFocus: 'dialog',
      })
      .closed.subscribe((guardado) => {
        if (guardado) {
          this.mensaje.set('Cambios guardados.');
          this.mesaSeleccionada.set(null);
          this.cargar();
        }
      });
  }
  protected readonly desplazamiento = signal<{ id: string; x: number; y: number } | null>(null);
  private arrastre: {
    id: string;
    pointer: number;
    inicioX: number;
    inicioY: number;
    x: number;
    y: number;
  } | null = null;
  protected iniciarArrastre(event: PointerEvent, mesa: Mesa) {
    if (!this.esAdmin || this.ocupado() || event.button !== 0) return;
    this.arrastre = {
      id: mesa.id,
      pointer: event.pointerId,
      inicioX: event.clientX,
      inicioY: event.clientY,
      x: mesa.positionX,
      y: mesa.positionY,
    };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }
  protected moverArrastre(event: PointerEvent) {
    const a = this.arrastre;
    if (!a || a.pointer !== event.pointerId) return;
    this.desplazamiento.set({
      id: a.id,
      x: Math.max(0, Math.round(a.x + event.clientX - a.inicioX)),
      y: Math.max(0, Math.round(a.y + event.clientY - a.inicioY)),
    });
  }
  protected terminarArrastre(event: PointerEvent) {
    const a = this.arrastre;
    const posicion = this.desplazamiento();
    if (!a || a.pointer !== event.pointerId) return;
    this.arrastre = null;
    if (!posicion || (posicion.x === a.x && posicion.y === a.y)) {
      this.desplazamiento.set(null);
      return;
    }
    this.guardarPosicion(a.id, posicion.x, posicion.y);
  }
  protected cancelarArrastre() {
    this.arrastre = null;
    this.desplazamiento.set(null);
  }
  protected moverTeclado(event: KeyboardEvent, mesa: Mesa) {
    if (!this.esAdmin || this.ocupado()) return;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-10, 0],
      ArrowRight: [10, 0],
      ArrowUp: [0, -10],
      ArrowDown: [0, 10],
    };
    const cambio = delta[event.key];
    if (!cambio) return;
    event.preventDefault();
    this.guardarPosicion(
      mesa.id,
      Math.max(0, mesa.positionX + cambio[0]),
      Math.max(0, mesa.positionY + cambio[1]),
    );
  }
  private guardarPosicion(id: string, x: number, y: number) {
    this.ocupado.set(true);
    this.errorOperacion.set('');
    this.service.editarMesa(id, { positionX: x, positionY: y }).subscribe({
      next: () => {
        this.zonas.update((zonas) =>
          zonas.map((zona) => ({
            ...zona,
            tables: zona.tables.map((mesa) =>
              mesa.id === id ? { ...mesa, positionX: x, positionY: y } : mesa,
            ),
          })),
        );
        this.desplazamiento.set(null);
        this.ocupado.set(false);
      },
      error: () => {
        this.desplazamiento.set(null);
        this.ocupado.set(false);
        this.errorOperacion.set('No se pudo guardar la posición. Inténtalo de nuevo.');
      },
    });
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
  private confirmar(title: string, message: string, accion: () => void) {
    this.dialog
      .open<boolean>(ConfirmDialog, {
        data: { title, message, confirmLabel: 'Desactivar' },
        ariaLabel: title,
        width: '440px',
        maxWidth: 'calc(100vw - 32px)',
        panelClass: 'app-dialog-panel',
        backdropClass: 'app-dialog-backdrop',
      })
      .closed.subscribe((confirmado) => {
        if (confirmado) accion();
      });
  }
  protected eliminarZona(zona: Zona) {
    this.confirmar('Desactivar zona', `¿Deseas desactivar la zona ${zona.name}?`, () =>
      this.operar(this.service.eliminarZona(zona.id), 'Zona desactivada.'),
    );
  }
  protected eliminarMesa(mesa: Mesa) {
    this.confirmar('Desactivar mesa', `¿Deseas desactivar la mesa ${mesa.number}?`, () =>
      this.operar(this.service.eliminarMesa(mesa.id), 'Mesa desactivada.'),
    );
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
