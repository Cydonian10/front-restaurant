import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { timeout } from 'rxjs';
import { email, form, required } from '@angular/forms/signals';
import { AuthService } from '../../access-control/auth.service';
import { AppFormField } from '../../../shared/components/form-field/form-field';

@Component({
  selector: 'app-login-form',
  imports: [AppFormField],
  templateUrl: './login-form.html',
  host: { class: 'block' },
})
export class LoginForm {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly model = signal({ email: '', password: '' });
  protected readonly loginForm = form(this.model, (schema) => {
    required(schema.email, { message: 'Ingresá tu correo electrónico.' });
    email(schema.email, { message: 'Ingresá un correo electrónico válido.' });
    required(schema.password, { message: 'Ingresá tu contraseña.' });
  });
  protected readonly attempted = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly googleStatus = signal<'checking' | 'enabled' | 'disabled' | 'error'>('checking');

  constructor() { this.checkGoogleConfig(); }

  protected checkGoogleConfig(): void {
    this.googleStatus.set('checking');
    this.auth.googleConfig().pipe(timeout(8000)).subscribe({
      next: ({ enabled }) => this.googleStatus.set(enabled ? 'enabled' : 'disabled'),
      error: () => this.googleStatus.set('error'),
    });
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.attempted.set(true);
    if (!this.loginForm().valid() || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.model();
    this.auth.login(email.trim(), password).subscribe({
      next: () => { this.loading.set(false); void this.router.navigateByUrl('/admin'); },
      error: (error: unknown) => {
        this.loading.set(false);
        this.error.set(error instanceof HttpErrorResponse && error.status === 401
          ? 'Correo o contraseña incorrectos.' : 'No se pudo iniciar sesión. Intentá de nuevo.');
      },
    });
  }

  protected loginWithGoogle(): void { this.auth.startGoogleLogin(); }
}
