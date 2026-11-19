import { Component, model } from '@angular/core';
import { UserRole } from '../../../auth/interfaces/auth-user.interface';
import { USUARIOS_LIMITES } from '../../constants/usuarios-limites.constants';
import { USUARIOS_ROLES } from '../../constants/usuarios-roles.constants';
import { UsuariosLimite } from '../../interfaces/usuarios-limite.type';
import { UsuariosVerificacion } from '../../interfaces/usuarios-verificacion.type';

@Component({
  selector: 'app-usuarios-filtros',
  templateUrl: './usuarios-filtros.html',
  host: { class: 'block' },
})
export class UsuariosFiltros {
  readonly search = model.required<string>();
  readonly role = model.required<UserRole | ''>();
  readonly emailVerified = model.required<UsuariosVerificacion>();
  readonly limit = model.required<UsuariosLimite>();

  protected readonly roles = Object.entries(USUARIOS_ROLES).map(([value, label]) => ({
    value,
    label,
  }));
  protected readonly limits = USUARIOS_LIMITES;

  protected changeRole(value: string): void {
    if (!value || Object.hasOwn(USUARIOS_ROLES, value)) {
      this.role.set(value as UserRole | '');
    }
  }

  protected changeVerification(value: string): void {
    if (value === '' || value === 'true' || value === 'false') this.emailVerified.set(value);
  }

  protected changeLimit(value: string): void {
    const limit = this.limits.find((option) => String(option) === value);
    if (limit !== undefined) this.limit.set(limit);
  }
}
