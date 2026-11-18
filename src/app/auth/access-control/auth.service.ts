import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SKIP_AUTH } from '../../core/http/auth-context';
import { AuthResponse } from '../interfaces/auth-response.interface';

const SESSION_KEY = 'restaurant.auth';
const api = `${environment.api.replace(/\/$/, '')}`;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = signal<AuthResponse | null>(this.readSession());
  readonly user = () => this.session()?.user ?? null;
  readonly token = () => this.session()?.accessToken ?? null;

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
    this.session.set(null);
    localStorage.removeItem(SESSION_KEY);
    void this.router.navigateByUrl('/auth/login');
  }

  private saveSession(response: AuthResponse): void {
    if (!response.accessToken || !response.user)
      throw new Error('Respuesta de autenticación inválida');
    localStorage.setItem(SESSION_KEY, JSON.stringify(response));
    this.session.set(response);
  }

  private readSession(): AuthResponse | null {
    try {
      const value = localStorage.getItem(SESSION_KEY);
      if (!value) return null;
      const session = JSON.parse(value) as AuthResponse;
      return typeof session.accessToken === 'string' && session.accessToken && session.user
        ? session
        : null;
    } catch {
      return null;
    }
  }
}
