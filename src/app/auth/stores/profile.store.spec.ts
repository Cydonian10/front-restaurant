import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProfileStore } from './profile.store';

const url = 'http://localhost:3000/api/v1/auth/me';
const user = {
  id: 'u1', name: 'Ana Pérez', email: 'ana@example.com', role: 'ADMIN' as const,
  emailVerified: true, createdAt: '2026-01-01',
  person: { id: 'p1', name: 'Ana', lastName: 'Pérez', phone: null, document: null, birthDate: null, residence: null },
};

describe('ProfileStore', () => {
  let store: ProfileStore;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    store = TestBed.inject(ProfileStore);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('shares one request and reuses the profile until the application is recreated', () => {
    const results: string[] = [];
    store.load().subscribe((profile) => results.push(profile.name));
    store.load().subscribe((profile) => results.push(profile.name));
    expect(store.status()).toBe('loading');
    http.expectOne(url).flush(user);
    expect(results).toEqual(['Ana Pérez', 'Ana Pérez']);
    expect(store.profile()).toEqual(user);
    store.load().subscribe();
    http.expectNone(url);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const reloaded = TestBed.inject(ProfileStore);
    const freshHttp = TestBed.inject(HttpTestingController);
    reloaded.load().subscribe();
    freshHttp.expectOne(url).flush(user);
    freshHttp.verify();
  });

  it('allows retry after connection errors', () => {
    store.load().subscribe({ error: () => {} });
    http.expectOne(url).error(new ProgressEvent('error'));
    expect(store.status()).toBe('error');
    store.load().subscribe();
    http.expectOne(url).flush(user);
    expect(store.status()).toBe('loaded');
  });

  it('does not restore an old profile when a pending request completes after clearing', () => {
    store.load().subscribe();
    const old = http.expectOne(url);
    store.clear();
    old.flush(user);
    expect(store.profile()).toBeNull();
    expect(store.status()).toBe('idle');
  });
});
