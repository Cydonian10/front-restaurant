import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { appConfig } from '../../../app.config';
import { AuthService } from '../../../auth/access-control/auth.service';
import { UserRole } from '../../../auth/interfaces/auth-user.interface';
import { ProfileStore } from '../../../auth/stores/profile.store';
import { UsuariosListado } from '../../usuarios.types';
import { UsuariosPage } from './usuarios.page';

const usersUrl = `${environment.api.replace(/\/$/, '')}/users`;
const empty: UsuariosListado = { items: [], page: 1, limit: 10, total: 0, totalPages: 0 };
const results: UsuariosListado = {
  ...empty,
  total: 140,
  totalPages: 14,
  items: [
    {
      id: 'user-1',
      email: 'ana@example.com',
      role: 'ATENCION',
      emailVerified: true,
      person: { name: 'Ana', lastName: 'Pérez', phone: '999000111' },
    },
    {
      id: 'user-2',
      email: 'sin-persona@example.com',
      role: 'MOZO',
      emailVerified: false,
      person: null,
    },
  ],
};

describe('UsuariosPage', () => {
  let fixture: ComponentFixture<UsuariosPage>;
  let root: HTMLElement;
  let http: HttpTestingController;
  const profile = signal<{ role: UserRole }>({ role: 'ADMIN' });
  const logout = vi.fn();

  beforeEach(() => {
    profile.set({ role: 'ADMIN' });
    logout.mockClear();
    TestBed.configureTestingModule({
      providers: [
        ...appConfig.providers,
        provideHttpClientTesting(),
        { provide: ProfileStore, useValue: { profile } },
        { provide: AuthService, useValue: { token: () => 'jwt-usuarios', logout } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  function init() {
    fixture = TestBed.createComponent(UsuariosPage);
    root = fixture.nativeElement;
    fixture.detectChanges();
  }

  function request(params: Record<string, string> = { page: '1', limit: '10' }) {
    fixture.detectChanges();
    const req = http.expectOne((req) => req.url === usersUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-usuarios');
    expect(
      Object.fromEntries(
        req.request.params.keys().map((key) => [key, req.request.params.get(key)]),
      ),
    ).toEqual(params);
    return req;
  }

  function clickPage(page: number) {
    root.querySelector<HTMLButtonElement>(`[aria-label="Página ${page}"]`)!.click();
  }

  function changeSelect(index: number, value: string) {
    const control = root.querySelectorAll('select')[index];
    control.value = value;
    control.dispatchEvent(new Event('change', { bubbles: true }));
  }

  it('renders loading, records with or without person data, and a numbered paginator', async () => {
    init();
    expect(root.textContent).toContain('Cargando usuarios');
    request().flush(results);
    await fixture.whenStable();
    expect(root.querySelector('table caption')?.textContent).toContain('Listado de usuarios');
    expect(root.querySelector('table tbody')?.textContent).toContain('Ana Pérez');
    expect(root.querySelector('table tbody')?.textContent).toContain('Sin nombre');
    expect(root.querySelector('table tbody')?.textContent).toContain('Sin teléfono');
    expect(root.querySelector('table tbody')?.textContent).toContain('Sin verificar');
    expect(root.querySelector('nav')?.textContent).toContain('…');
    expect(root.querySelector('[aria-current="page"]')?.textContent).toContain('1');
    expect(root.querySelector<HTMLButtonElement>('[aria-label="Página anterior"]')?.disabled).toBe(
      true,
    );

    clickPage(4);
    request({ page: '4', limit: '10' }).flush({ ...results, page: 4 });
    await fixture.whenStable();
    expect(
      Array.from(root.querySelector('nav')!.children, (item) => item.textContent.trim()),
    ).toEqual(['‹Anterior', '1', '…', '3', '4', '5', '…', '14', 'Siguiente›']);
    expect(root.querySelector('[aria-current="page"]')?.textContent).toContain('4');

    clickPage(14);
    request({ page: '14', limit: '10' }).flush({
      ...results,
      page: 14,
      total: 125,
      totalPages: 13,
      items: [],
    });
    await fixture.whenStable();
    expect(root.textContent).toContain('No hay usuarios en esta página.');
    expect(root.querySelector('[aria-current="page"]')).toBeNull();
    clickPage(1);
    request().flush(empty);
    await fixture.whenStable();
    expect(root.textContent).toContain('No se encontraron usuarios.');
    expect(root.querySelector('nav')).toBeNull();
  });

  it('resets the page when role, verification, or page size changes', async () => {
    init();
    request().flush(results);
    await fixture.whenStable();
    clickPage(2);
    request({ page: '2', limit: '10' }).flush({ ...results, page: 2 });
    await fixture.whenStable();

    changeSelect(0, 'MOZO');
    request({ page: '1', limit: '10', role: 'MOZO' }).flush(results);
    await fixture.whenStable();
    clickPage(2);
    request({ page: '2', limit: '10', role: 'MOZO' }).flush({ ...results, page: 2 });
    await fixture.whenStable();

    changeSelect(1, 'false');
    request({ page: '1', limit: '10', role: 'MOZO', emailVerified: 'false' }).flush(results);
    await fixture.whenStable();
    clickPage(2);
    request({ page: '2', limit: '10', role: 'MOZO', emailVerified: 'false' }).flush({
      ...results,
      page: 2,
    });
    await fixture.whenStable();

    changeSelect(2, '100');
    request({ page: '1', limit: '100', role: 'MOZO', emailVerified: 'false' }).flush({
      ...empty,
      limit: 100,
    });
    changeSelect(1, 'true');
    request({ page: '1', limit: '100', role: 'MOZO', emailVerified: 'true' }).flush({
      ...empty,
      limit: 100,
    });
  });

  it('debounces search, trims the term and resets the page in the same request', async () => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'Date'] });
    init();
    request().flush(results);
    await fixture.whenStable();
    clickPage(2);
    request({ page: '2', limit: '10' }).flush({ ...results, page: 2 });
    await fixture.whenStable();
    const input = root.querySelector<HTMLInputElement>('input[type="search"]')!;
    const search = (value: string) => {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      return fixture.whenStable();
    };

    await search('a');
    vi.advanceTimersByTime(150);
    await search('  Ana + Pérez  ');
    vi.advanceTimersByTime(299);
    await fixture.whenStable();
    http.expectNone((req) => req.url === usersUrl);
    vi.advanceTimersByTime(1);
    request({ page: '1', limit: '10', search: 'Ana + Pérez' }).flush(empty);
  });

  it('retries an error and shows a separate state for an API 403 without logging out', async () => {
    init();
    request().flush({}, { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('No se pudo cargar');
    root.querySelector<HTMLButtonElement>('section button')!.click();
    request().flush({}, { status: 403, statusText: 'Forbidden' });
    await fixture.whenStable();
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('Acceso denegado');
    expect(root.querySelector('section button')).toBeNull();
    expect(logout).not.toHaveBeenCalled();
  });

  it('does not request the list for a non-admin accessing the page directly', () => {
    profile.set({ role: 'COCINA' });
    init();
    http.expectNone((req) => req.url === usersUrl);
    expect(root.querySelector('[role="alert"]')?.textContent).toContain('Acceso denegado');
  });
});
