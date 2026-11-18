import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { DialogShell } from '../dialog/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [DialogShell],
  template: `
    <app-dialog [title]="data.title" (closed)="ref.close(false)">
      <p class="m-0 leading-relaxed text-base-content/70">{{ data.message }}</p>
      <div dialog-footer class="flex flex-wrap justify-end gap-2.5">
        <button class="btn btn-ghost" type="button" (click)="ref.close(false)">
          {{ data.cancelLabel || 'Cancelar' }}
        </button>
        <button class="btn btn-primary" type="button" (click)="ref.close(true)">
          {{ data.confirmLabel || 'Confirmar' }}
        </button>
      </div>
    </app-dialog>
  `,

})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmDialogData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
}
