import { Component, computed, input } from '@angular/core';
import { Field, FormField } from '@angular/forms/signals';

@Component({
  selector: 'app-form-textarea',
  imports: [FormField],
  templateUrl: './form-textarea.html',
  host: { class: 'block' },
})
export class FormTextarea {
  readonly field = input.required<Field<string>>();
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly placeholder = input('');
  readonly submitted = input(false);
  protected readonly showError = computed(
    () => (this.submitted() || this.field()().touched()) && this.field()().invalid(),
  );
}
