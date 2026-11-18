import { Component, signal } from '@angular/core';
import { email, form, required } from '@angular/forms/signals';
import { AppFormField } from '../../../shared/components/form-field/form-field';

@Component({
  selector: 'app-login-form',
  imports: [AppFormField],
  templateUrl: './login-form.html',
  host: { class: 'block' },
})
export class LoginForm {
  private readonly model = signal({ email: '', password: '' });

  protected readonly loginForm = form(this.model, (schema) => {
    required(schema.email, { message: 'Ingresá tu correo electrónico.' });
    email(schema.email, { message: 'Ingresá un correo electrónico válido.' });
    required(schema.password, { message: 'Ingresá tu contraseña.' });
  });

  protected readonly attempted = signal(false);

  protected readonly unavailable = signal(false);

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.attempted.set(true);
    this.unavailable.set(this.loginForm().valid());
  }
}
