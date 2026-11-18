import { Component, computed, input, signal } from '@angular/core';
import { Field, FormField } from '@angular/forms/signals';
import { LucideEye, LucideEyeOff } from '@lucide/angular';

@Component({
  selector: 'app-form-field',
  imports: [FormField, LucideEye, LucideEyeOff],
  templateUrl: './form-field.html',
  host: { class: 'block' },
})
export class AppFormField<T extends string | number | null> {
  readonly field = input.required<Field<T>>();
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly type = input<'text' | 'email' | 'password' | 'number'>('text');
  readonly placeholder = input('');
  readonly autocomplete = input<string>();
  readonly submitted = input(false);
  protected readonly showPassword = signal(false);
  protected readonly showError = computed(
    () => (this.submitted() || this.field()().touched()) && this.field()().invalid(),
  );
}
