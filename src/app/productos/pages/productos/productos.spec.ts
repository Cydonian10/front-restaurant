import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ProfileStore } from '../../../auth/stores/profile.store';
import { Productos } from './productos';

const url = `${environment.api.replace(/\/$/, '')}/products/admin`;
describe('Productos', () => {
  const profile = signal<{ role: string }>({ role: 'ADMIN' });
  let http: HttpTestingController;
  beforeEach(() => {
    profile.set({ role: 'ADMIN' });
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: ProfileStore, useValue: { profile } }] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('no consulta productos sin rol administrador', () => {
    profile.set({ role: 'MOZO' }); const fixture = TestBed.createComponent(Productos); fixture.detectChanges();
    http.expectNone(url); expect(fixture.nativeElement.textContent).toContain('Acceso denegado');
  });
  it('muestra vacío, filtra por tipo y permite reintentar ante errores', async () => {
    const fixture = TestBed.createComponent(Productos); fixture.detectChanges();
    http.expectOne(r => r.url === url).flush({ items: [], page: 1, limit: 10, total: 0, totalPages: 0 });
    await fixture.whenStable(); fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('No hay productos');
    const botones = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    botones.find(b => b.textContent?.includes('Bebidas'))!.click(); fixture.detectChanges();
    const req = http.expectOne(r => r.url === url && r.params.get('tipo') === 'BEBIDA');
    expect(req.request.params.get('page')).toBe('1'); req.flush({}, { status: 500, statusText: 'Error' });
    await fixture.whenStable(); fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('No se pudo cargar');
    (Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[]).find(b => b.textContent?.includes('Reintentar'))!.click(); fixture.detectChanges();
    http.expectOne(r => r.url === url).flush({ items: [], page: 1, limit: 10, total: 0, totalPages: 0 });
  });
  it('actualiza disponibilidad y recarga el listado tras confirmar el servidor', async () => {
    const fixture = TestBed.createComponent(Productos); fixture.detectChanges();
    const item = { id: '123', nombre: 'Sopa', descripcion: null, precio: '12.00', tipo: 'PLATO_FONDO', principal: true, disponible: true, imageUrl: null, createdAt: '', updatedAt: '' };
    const respuesta = { items: [item], page: 1, limit: 10, total: 1, totalPages: 1 };
    http.expectOne(r => r.url === url).flush(respuesta); await fixture.whenStable(); fixture.detectChanges();
    (Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[]).find(b => b.textContent?.includes('Desactivar'))!.click();
    const req = http.expectOne(`${environment.api.replace(/\/$/, '')}/products/123/disponibilidad`);
    expect(req.request.body).toEqual({ disponible: false }); req.flush({ id: '123', disponible: false }); fixture.detectChanges();
    http.expectOne(r => r.url === url).flush({ ...respuesta, items: [{ ...item, disponible: false }] });
    await fixture.whenStable(); fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('No disponible');
  });

});
