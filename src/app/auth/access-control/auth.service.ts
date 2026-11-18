import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SKIP_AUTH } from '../../core/http/auth-context';
import { ProfileStore } from '../stores/profile.store';
import { AuthResponse } from '../interfaces/auth-response.interface';

const SESSION_KEY = 'restaurant.auth';
const api = `${environment.api.replace(/\/$/, '')}`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly profile = inject(ProfileStore);
  private readonly tokenState = signal<string | null>(this.readToken());
  readonly token = this.tokenState.asReadonly();

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(
        `${api}/auth/login`,
        { email, password },
        {
          context: new HttpContext().set(SKIP_AUTH, true),
        },
      )
      .pipe(tap((response) => this.saveSession(response)));
  }

  googleConfig() {
    return this.http.get<{ enabled: boolean }>(`${api}/auth/oidc/google/config`, {
      context: new HttpContext().set(SKIP_AUTH, true),
    });
  }

  startGoogleLogin(): void {
    window.location.assign(`${api}/auth/oidc/google/login`);
  }

  exchangeGoogleCode(code: string) {
    return this.http
      .post<AuthResponse>(
        `${api}/auth/oidc/google/exchange`,
        { code },
        {
          context: new HttpContext().set(SKIP_AUTH, true),
          withCredentials: true,
        },
      )
      .pipe(tap((response) => this.saveSession(response)));
  }

  logout(): void {
    this.tokenState.set(null);
    this.profile.clear();
    localStorage.removeItem(SESSION_KEY);
    void this.router.navigateByUrl('/auth/login');
  }

  private saveSession(response: AuthResponse): void {
    if (!response.accessToken) throw new Error('Respuesta de autenticación inválida');
    this.profile.clear();
    localStorage.setItem(SESSION_KEY, JSON.stringify({ accessToken: response.accessToken }));
    this.tokenState.set(response.accessToken);
  }

  private readToken(): string | null {
    try {
      const value = localStorage.getItem(SESSION_KEY);
      if (!value) return null;
      const session = JSON.parse(value) as { accessToken?: unknown };
      if (typeof session.accessToken !== 'string' || !session.accessToken) return null;
      if ('user' in session) localStorage.setItem(SESSION_KEY, JSON.stringify({ accessToken: session.accessToken }));
      return session.accessToken;
    } catch { return null; }
  }
}
