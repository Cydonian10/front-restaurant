import { Component, input, output } from '@angular/core';

/** Shared dialog shell. The caller supplies the body and footer actions. */
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.html',
  styleUrl: './dialog.css',
})
export class DialogShell {
  readonly title = input.required<string>();
  readonly closed = output<void>();
}
