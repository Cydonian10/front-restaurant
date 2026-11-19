import { Component, input } from '@angular/core';
import { TablaBase } from '../../../shared/components/tabla-base/tabla-base';
import { USUARIOS_ROLES, UsuarioListado } from '../../usuarios.types';

@Component({
  selector: 'app-usuarios-tabla',
  imports: [TablaBase],
  templateUrl: './usuarios-tabla.html',
  host: { class: 'block' },
})
export class UsuariosTabla {
  readonly items = input.required<readonly UsuarioListado[]>();
  protected readonly roles = USUARIOS_ROLES;
}
