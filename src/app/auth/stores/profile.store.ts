import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, of, shareReplay, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthUser } from '../interfaces/auth-user.interface';

type ProfileStatus = 'idle' | 'loading' | 'loaded' | 'error';

@Injectable({ providedIn: 'root' })
export class ProfileStore {
  private readonly http = inject(HttpClient);
  private readonly profileState = signal<AuthUser | null>(null);
  private readonly statusState = signal<ProfileStatus>('idle');
  private pending?: Observable<AuthUser>;
  private generation = 0;
  readonly profile = this.profileState.asReadonly();
  readonly status = this.statusState.asReadonly();

  load(): Observable<AuthUser> {
    const profile = this.profileState();
    if (profile) return of(profile);
    if (this.pending) return this.pending;
    const generation = this.generation;
    this.statusState.set('loading');
    const request = this.http.get<AuthUser>(`${environment.api.replace(/\/$/, '')}/auth/me`).pipe(
      tap({
        next: (user) => {
          if (this.generation === generation) {
            this.profileState.set(user);
            this.statusState.set('loaded');
          }
        },
        error: () => {
          if (this.generation === generation) this.statusState.set('error');
        },
      }),
      finalize(() => {
        if (this.pending === request) this.pending = undefined;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.pending = request;
    return request;
  }

  clear(): void {
    this.generation++;
    this.pending = undefined;
    this.profileState.set(null);
    this.statusState.set('idle');
  }
}
