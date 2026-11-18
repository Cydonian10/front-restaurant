import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authInterceptor } from '../../core/http/auth.interceptor';
import { ProfileStore } from '../stores/profile.store';
import { AuthService } from './auth.service';

const api = 'http://localhost:3000/api/v1';
const user = { id: '1', name: 'Ana', email: 'ana@example.com', role: 'CLIENTE', emailVerified: false, createdAt: '2026-01-01', person: { id: 'p1', name: 'Ana', lastName: null, phone: null, document: null, birthDate: null, residence: null } };

describe('session and profile', () => {
  let values: Map<string, string>;
  let http: HttpTestingController;
  let auth: AuthService;
  let profile: ProfileStore;
  const router = { navigateByUrl: vi.fn().mockResolvedValue(true) };
  beforeEach(() => {
    values = new Map();
    Object.defineProperty(window, 'localStorage', { configurable: true, value: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    } });
    TestBed.configureTestingModule({ providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(), { provide: Router, useValue: router }] });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    profile = TestBed.inject(ProfileStore);
  });
  afterEach(() => http.verify());

  it('stores only the token, loads the profile using JWT, and clears both on logout', () => {
    auth.login(user.email, 'password').subscribe();
    const login = http.expectOne(`${api}/auth/login`);
    expect(login.request.headers.has('Authorization')).toBe(false);
    login.flush({ accessToken: 'jwt', user });
    expect(JSON.parse(values.get('restaurant.auth')!)).toEqual({ accessToken: 'jwt' });
    profile.load().subscribe();
    const me = http.expectOne(`${api}/auth/me`);
    expect(me.request.headers.get('Authorization')).toBe('Bearer jwt');
    me.flush(user);
    expect(profile.profile()?.role).toBe('CLIENTE');
    auth.logout();
    expect(profile.profile()).toBeNull();
    expect(auth.token()).toBeNull();
    expect(values.has('restaurant.auth')).toBe(false);
  });

  it('loads the profile after Google token exchange', () => {
    auth.exchangeGoogleCode('code').subscribe();
    const exchange = http.expectOne(`${api}/auth/oidc/google/exchange`);
    expect(exchange.request.withCredentials).toBe(true);
    exchange.flush({ accessToken: 'google-jwt', user });
    profile.load().subscribe();
    const me = http.expectOne(`${api}/auth/me`);
    expect(me.request.headers.get('Authorization')).toBe('Bearer google-jwt');
    me.flush(user);
    expect(profile.profile()?.name).toBe('Ana');
  });
});
