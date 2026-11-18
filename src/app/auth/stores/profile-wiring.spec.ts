import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { appConfig } from '../../app.config';
import { ProfileStore } from './profile.store';

describe('profile application wiring', () => {
  it('sends a restored session token using the application providers', () => {
    const data = new Map([['restaurant.auth', JSON.stringify({ accessToken: 'stored-jwt' })]]);
    Object.defineProperty(window, 'localStorage', { configurable: true, value: {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
      removeItem: (key: string) => data.delete(key),
    } });
    TestBed.configureTestingModule({ providers: [...appConfig.providers, provideHttpClientTesting()] });
    const profile = TestBed.inject(ProfileStore);
    const http = TestBed.inject(HttpTestingController);
    profile.load().subscribe();
    const request = http.expectOne('http://localhost:3000/api/v1/auth/me');
    expect(request.request.headers.get('Authorization')).toBe('Bearer stored-jwt');
    request.flush({});
    http.verify();
  });
});
