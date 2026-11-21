import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface Mesa {
  id: string;
  number: number;
  capacity: number;
  positionX: number;
  positionY: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'OUT_OF_SERVICE';
}
export interface Zona {
  id: string;
  name: string;
  tables: Mesa[];
}

@Injectable({ providedIn: 'root' })
export class MesasService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.api.replace(/\/$/, '')}/dining`;
  crearZona(name: string) {
    return this.http.post<Zona>(`${this.base}/zones`, { name });
  }
  editarZona(id: string, name: string) {
    return this.http.patch(`${this.base}/zones/${id}`, { name });
  }
  eliminarZona(id: string) {
    return this.http.delete(`${this.base}/zones/${id}`);
  }
  crearMesa(zoneId: string, number: number, capacity: number) {
    return this.http.post(`${this.base}/tables`, { zoneId, number, capacity });
  }
  editarMesa(id: string, cambios: { number?: number; capacity?: number; outOfService?: boolean; positionX?: number; positionY?: number }) {
    return this.http.patch(`${this.base}/tables/${id}`, cambios);
  }
  eliminarMesa(id: string) {
    return this.http.delete(`${this.base}/tables/${id}`);
  }
  listar() {
    return this.http.get<Zona[]>(`${environment.api.replace(/\/$/, '')}/dining/zones`);
  }
}
