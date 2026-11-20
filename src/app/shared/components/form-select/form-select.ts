import { Component, computed, input } from '@angular/core';
import { Field, FormField } from '@angular/forms/signals';

@Component({ selector: 'app-form-select', imports: [FormField], templateUrl: './form-select.html', host: { class: 'block' } })
export class FormSelect<T extends string> {
  readonly field = input.required<Field<T>>();
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly options = input.required<readonly { value: T; label: string }[]>();
  readonly submitted = input(false);
  protected readonly showError = computed(() => (this.submitted() || this.field()().touched()) && this.field()().invalid());
}
