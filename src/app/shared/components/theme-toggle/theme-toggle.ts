import { DOCUMENT } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { LucideMoon, LucideSun } from '@lucide/angular';

@Component({
  selector: 'app-theme-toggle',
  imports: [LucideMoon, LucideSun],
  templateUrl: './theme-toggle.html',
})
export class ThemeToggle {
  private readonly document = inject(DOCUMENT);
  protected readonly isDark = signal(this.readTheme());

  constructor() {
    this.applyTheme();
  }

  protected toggleTheme(): void {
    this.isDark.update((dark) => !dark);
    this.applyTheme();
    try {
      this.document.defaultView?.localStorage.setItem(
        'theme',
        this.isDark() ? 'vasquez-dark' : 'vasquez-light',
      );
    } catch {
      // The theme still works when browser storage is unavailable.
    }
  }

  private readTheme(): boolean {
    try {
      return this.document.defaultView?.localStorage.getItem('theme') !== 'vasquez-light';
    } catch {
      return true;
    }
  }

  private applyTheme(): void {
    this.document.documentElement.setAttribute(
      'data-theme',
      this.isDark() ? 'vasquez-dark' : 'vasquez-light',
    );
  }
}
