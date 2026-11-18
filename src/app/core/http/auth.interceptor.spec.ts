import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from '../../auth/access-control/auth.service';
import { SKIP_AUTH } from './auth-context';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let requests: HttpTestingController;
  const auth = { token: () => 'jwt-de-prueba', logout: vi.fn() };

  beforeEach(() => {
    auth.logout.mockClear();
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(),
      { provide: AuthService, useValue: auth },
    ] });
    http = TestBed.inject(HttpClient);
    requests = TestBed.inject(HttpTestingController);
  });
  afterEach(() => requests.verify());

  it('sends the token to protected API endpoints', () => {
    http.get('http://localhost:3000/api/v1/auth/me').subscribe();
    const req = requests.expectOne('http://localhost:3000/api/v1/auth/me');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-de-prueba');
    req.flush({});
  });

  it('omits the token for public requests and other origins', () => {
    http.get('http://localhost:3000/api/v1/auth/oidc/google/config', {
      context: new HttpContext().set(SKIP_AUTH, true),
    }).subscribe();
    http.get('https://other.example/api/v1/auth/me').subscribe();
    for (const url of ['http://localhost:3000/api/v1/auth/oidc/google/config', 'https://other.example/api/v1/auth/me']) {
      const req = requests.expectOne(url);
      expect(req.request.headers.has('Authorization')).toBe(false);
      req.flush({});
    }
  });

  it('clears the session when a protected API request is unauthorized', () => {
    http.get('http://localhost:3000/api/v1/auth/me').subscribe({ error: () => {} });
    requests.expectOne('http://localhost:3000/api/v1/auth/me').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.logout).toHaveBeenCalledOnce();
  });
});
