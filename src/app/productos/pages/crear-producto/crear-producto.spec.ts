import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ProfileStore } from '../../../auth/stores/profile.store';
import { CrearProducto } from './crear-producto';

describe('CrearProducto', () => {
  const profile = signal({ role: 'ADMIN' });
  let http: HttpTestingController;
  const url = `${environment.api.replace(/\/$/, '')}/products`;
  beforeEach(() => {
    profile.set({ role: 'ADMIN' });
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting(), { provide: ProfileStore, useValue: { profile } }] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('impide crear productos sin rol administrador', () => {
    profile.set({ role: 'MOZO' }); const fixture = TestBed.createComponent(CrearProducto); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Acceso denegado');
    expect(fixture.nativeElement.querySelector('form')).toBeNull(); http.expectNone(url);
  });
  it('valida el formulario y muestra el resultado de la creación', async () => {
    const fixture = TestBed.createComponent(CrearProducto); fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const form = root.querySelector('form')!;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); fixture.detectChanges();
    http.expectNone(url); expect(root.textContent).toContain('Ingresa un nombre');
    const nombre = root.querySelector<HTMLInputElement>('#producto-nombre')!; nombre.value = 'Sopa'; nombre.dispatchEvent(new Event('input', { bubbles: true }));
    const precio = root.querySelector<HTMLInputElement>('#producto-precio')!; precio.value = '12.50'; precio.dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges(); form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const req = http.expectOne(url); expect((req.request.body as FormData).get('nombre')).toBe('Sopa'); req.flush({});
    await fixture.whenStable(); fixture.detectChanges(); expect(root.textContent).toContain('Producto creado correctamente');
  });
});
