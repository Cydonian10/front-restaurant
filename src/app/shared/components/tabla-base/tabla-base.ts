import { Component, input } from '@angular/core';

@Component({
  selector: 'app-tabla-base',
  template: `
    <div
      class="overflow-x-auto rounded-2xl border border-base-content/10 bg-base-200 focus-visible:outline-2 focus-visible:outline-primary"
      role="region"
      [attr.aria-label]="label()"
      tabindex="0"
    >
      <table class="table w-full text-left">
        <caption class="sr-only">
          {{
            label()
          }}
        </caption>
        <ng-content select="thead, tbody, tfoot" />
      </table>
    </div>
  `,
  host: { class: 'block min-w-0' },
})
export class TablaBase {
  readonly label = input.required<string>();
}
