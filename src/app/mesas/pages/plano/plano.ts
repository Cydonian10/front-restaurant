import { Component, inject, signal } from '@angular/core';
import { ProfileStore } from '../../../auth/stores/profile.store';
import { MesasService, Zona } from '../../access-data/mesas.service';

@Component({ selector: 'app-plano', templateUrl: './plano.html', styleUrl: './plano.css' })
export class Plano {
  private readonly service = inject(MesasService);
  protected readonly profile = inject(ProfileStore);
  protected readonly zonas = signal<Zona[]>([]);
  protected readonly seleccion = signal<string | null>(null);
  protected readonly estado = signal<'cargando' | 'listo' | 'error'>('cargando');
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
        this.seleccion.set(zonas[0]?.id ?? null);
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
