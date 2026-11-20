import { Component, input, output, signal } from '@angular/core';
import { LucideUploadCloud } from '@lucide/angular';

@Component({ selector: 'app-file-dropzone', imports: [LucideUploadCloud], templateUrl: './file-dropzone.html', styleUrl: './file-dropzone.css', host: { class: 'block' } })
export class FileDropzone {
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly hint = input('');
  readonly accept = input('');
  readonly disabled = input(false);
  readonly selectedFile = input<File | undefined>();
  readonly fileChange = output<File | undefined>();
  protected readonly dragging = signal(false);
  protected change(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileChange.emit(input.files?.[0]);
    input.value = '';
  }
  protected drag(event: DragEvent): void {
    event.preventDefault();
    if (!this.disabled()) this.dragging.set(true);
  }
  protected drop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    if (!this.disabled()) this.fileChange.emit(event.dataTransfer?.files[0]);
  }
}
