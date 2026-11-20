import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import type { ProductosConsulta } from '../interfaces/productos-consulta.interface';
import { ProductosService } from './productos.service';

describe('ProductosService', () => {
  const url = `${environment.api.replace(/\/$/, '')}/products`;
  let http: HttpTestingController;
  let service: ProductosService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ProductosService);
  });
  afterEach(() => http.verify());

  it('omite solicitudes deshabilitadas y aplica paginación y tipo', () => {
    const consulta = signal<ProductosConsulta | undefined>(undefined);
    TestBed.runInInjectionContext(() => service.listado(consulta));
    TestBed.tick(); http.expectNone(`${url}/admin`);
    consulta.set({ page: 2, limit: 10, tipo: 'BEBIDA' }); TestBed.tick();
    const req = http.expectOne(r => r.url === `${url}/admin`);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('tipo')).toBe('BEBIDA');
    req.flush({ items: [], page: 2, limit: 10, total: 0, totalPages: 0 });
  });

  it('envía creación multipart con y sin imagen', () => {
    const imagen = new File(['imagen'], 'foto.png', { type: 'image/png' });
    service.crear({ nombre: 'Sopa', precio: '12.50', tipo: 'PLATO_FONDO', imagen }).subscribe();
    const req = http.expectOne(url); const body = req.request.body as FormData;
    expect(req.request.method).toBe('POST'); expect(body.get('imagen')).toBe(imagen);
    expect(body.get('precio')).toBe('12.50'); expect(body.has('descripcion')).toBe(false); req.flush({});
    service.crear({ nombre: 'Agua', precio: '0', tipo: 'BEBIDA' }).subscribe();
    const sinImagen = http.expectOne(url); expect((sinImagen.request.body as FormData).has('imagen')).toBe(false); sinImagen.flush({});
  });

  it('envía disponibilidad y comunica conflicto al agregar imagen', () => {
    service.cambiarDisponibilidad('123', false).subscribe();
    const cambio = http.expectOne(`${url}/123/disponibilidad`);
    expect(cambio.request.method).toBe('PATCH'); expect(cambio.request.body).toEqual({ disponible: false }); cambio.flush({ id: '123', disponible: false });
    let estado = 0;
    service.agregarImagen('123', new File(['x'], 'x.png', { type: 'image/png' })).subscribe({ error: e => estado = e.status });
    const imagen = http.expectOne(`${url}/123/imagen`); expect((imagen.request.body as FormData).has('imagen')).toBe(true);
    imagen.flush({}, { status: 409, statusText: 'Conflict' }); expect(estado).toBe(409);
  });
});
