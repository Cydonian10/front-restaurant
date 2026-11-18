import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, required } from '@angular/forms/signals';
import { AppFormField } from './form-field';

@Component({
  imports: [AppFormField],
  template: `
    <app-form-field inputId="quantity" label="Cantidad" type="number" [field]="fields.quantity" />
  `,
})
class NumberFieldHost {
  readonly model = signal({ quantity: 1 });
  readonly fields = form(this.model, (schema) => required(schema.quantity));
}

describe('AppFormField', () => {
  it('binds numeric input to a signal form', async () => {
    const fixture = TestBed.createComponent(NumberFieldHost);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('number');
    input.value = '42';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.model().quantity).toBe(42);
    expect(fixture.nativeElement.querySelector('label').htmlFor).toBe('quantity');
  });
});
