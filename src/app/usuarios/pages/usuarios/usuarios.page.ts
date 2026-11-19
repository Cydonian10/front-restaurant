import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserRole } from '../../../auth/interfaces/auth-user.interface';
import { ProfileStore } from '../../../auth/stores/profile.store';
import { Paginador } from '../../../shared/components/paginador/paginador';
import { UsuariosFiltros } from '../../components/usuarios-filtros/usuarios-filtros';
import { UsuariosTabla } from '../../components/usuarios-tabla/usuarios-tabla';
import { UsuariosLimite } from '../../interfaces/usuarios-limite.type';
import { UsuariosListado } from '../../interfaces/usuarios-listado.interface';
import { UsuariosVerificacion } from '../../interfaces/usuarios-verificacion.type';

@Component({
  selector: 'app-usuarios',
  imports: [Paginador, UsuariosFiltros, UsuariosTabla],
  templateUrl: './usuarios.page.html',
  host: { class: 'block' },
})
export class UsuariosPage {
  private readonly profileStore = inject(ProfileStore);
  private readonly isAdmin = computed(() => this.profileStore.profile()?.role === 'ADMIN');

  protected readonly search = signal('');
  protected readonly role = signal<UserRole | ''>('');
  protected readonly emailVerified = signal<UsuariosVerificacion>('');
  protected readonly limit = signal<UsuariosLimite>(10);
  private readonly debouncedSearch = toSignal(
    toObservable(this.search).pipe(
      map((search) => search.trim()),
      distinctUntilChanged(),
      debounceTime(300),
    ),
    { initialValue: '' },
  );
  private readonly filters = computed(() => ({
    search: this.debouncedSearch(),
    role: this.role(),
    emailVerified: this.emailVerified(),
    limit: this.limit(),
  }));
  protected readonly page = linkedSignal(() => {
    this.filters();
    return 1;
  });

  protected readonly usuarios = httpResource<UsuariosListado>(() => {
    if (!this.isAdmin()) return undefined;

    const { search, role, emailVerified, limit } = this.filters();
    const params: Record<string, string | number> = { page: this.page(), limit };
    if (search) params['search'] = search;
    if (role) params['role'] = role;
    if (emailVerified) params['emailVerified'] = emailVerified;

    return { url: `${environment.api.replace(/\/$/, '')}/users`, params };
  });

  protected readonly listado = computed(() =>
    this.usuarios.hasValue() ? this.usuarios.value() : undefined,
  );
  protected readonly forbidden = computed(() => {
    const error = this.usuarios.error();
    return !this.isAdmin() || (error instanceof HttpErrorResponse && error.status === 403);
  });

  // Retain the paginator (and keyboard focus) while fetching another page of the same results.
  protected readonly totalPages = linkedSignal({
    source: () => ({ filters: this.filters(), listado: this.listado() }),
    computation: ({ filters, listado }, previous): number =>
      listado?.totalPages ?? (previous?.source.filters === filters ? previous.value : 0),
  }).asReadonly();
}
