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
  listar() {
    return this.http.get<Zona[]>(`${environment.api.replace(/\/$/, '')}/dining/zones`);
  }
}
