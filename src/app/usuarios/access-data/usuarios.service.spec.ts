import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { UsuariosConsulta } from '../interfaces/usuarios-consulta.interface';
import { UsuariosService } from './usuarios.service';

describe('UsuariosService', () => {
  const url = `${environment.api.replace(/\/$/, '')}/users`;
  const consulta: UsuariosConsulta = {
    page: 1,
    limit: 10,
    search: '',
    role: '',
    emailVerified: '',
  };
  const respuesta = { items: [], page: 1, limit: 10, total: 0, totalPages: 0 };
  let http: HttpTestingController;
  let service: UsuariosService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(UsuariosService);
  });

  afterEach(() => http.verify());

  it('desactiva la consulta y actualiza los parámetros cuando cambia la señal', async () => {
    const filtros = signal<UsuariosConsulta | undefined>(undefined);
    const recurso = TestBed.runInInjectionContext(() => service.listado(filtros));
    TestBed.tick();
    http.expectNone(url);

    filtros.set(consulta);
    TestBed.tick();
    const inicial = http.expectOne((req) => req.url === url);
    expect(inicial.request.method).toBe('GET');
    expect(inicial.request.params.toString()).toBe('page=1&limit=10');
    inicial.flush(respuesta);
    await TestBed.inject(ApplicationRef).whenStable();
    expect(recurso.value()).toEqual(respuesta);

    filtros.set({ page: 2, limit: 25, search: 'Ana Pérez', role: 'MOZO', emailVerified: 'false' });
    TestBed.tick();
    const filtrada = http.expectOne((req) => req.url === url);
    expect(
      Object.fromEntries(
        filtrada.request.params.keys().map((key) => [key, filtrada.request.params.get(key)]),
      ),
    ).toEqual({
      page: '2',
      limit: '25',
      search: 'Ana Pérez',
      role: 'MOZO',
      emailVerified: 'false',
    });
    filtrada.flush({ ...respuesta, page: 2, limit: 25 });

    filtros.set(undefined);
    TestBed.tick();
    http.expectNone(url);
    expect(recurso.hasValue()).toBe(false);
  });

  it('crea recursos independientes para distintos consumidores', async () => {
    const primero = signal<UsuariosConsulta>(consulta);
    const segundo = signal<UsuariosConsulta>({ ...consulta, page: 2 });
    const [recursoUno, recursoDos] = TestBed.runInInjectionContext(() => [
      service.listado(primero),
      service.listado(segundo),
    ]);
    TestBed.tick();
    http.expectOne((req) => req.url === url && req.params.get('page') === '1').flush(respuesta);
    http
      .expectOne((req) => req.url === url && req.params.get('page') === '2')
      .flush({ ...respuesta, page: 2 });
    await TestBed.inject(ApplicationRef).whenStable();
    expect(recursoUno.value()?.page).toBe(1);
    expect(recursoDos.value()?.page).toBe(2);

    primero.set({ ...consulta, page: 3 });
    TestBed.tick();
    http
      .expectOne((req) => req.url === url && req.params.get('page') === '3')
      .flush({ ...respuesta, page: 3 });
    expect(recursoDos.value()?.page).toBe(2);
  });
});
