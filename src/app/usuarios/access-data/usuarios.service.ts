import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { UsuariosConsulta } from '../interfaces/usuarios-consulta.interface';
import { UsuariosListado } from '../interfaces/usuarios-listado.interface';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  apiUrl = `${environment.api.replace(/\/$/, '')}/users`;

  // Create the resource in the caller's injection context so its lifecycle belongs to the caller.
  listado(consulta: () => UsuariosConsulta | undefined) {
    return httpResource<UsuariosListado>(() => {
      const filtros = consulta();
      if (!filtros) return undefined;

      const { page, limit, search, role, emailVerified } = filtros;
      const params: Record<string, string | number> = { page, limit };
      if (search) params['search'] = search;
      if (role) params['role'] = role;
      if (emailVerified) params['emailVerified'] = emailVerified;

      return { url: this.apiUrl, params };
    });
  }
}
