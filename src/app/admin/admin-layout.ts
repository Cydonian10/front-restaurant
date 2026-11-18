import { Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  protected readonly menuOpen = signal(false);
  protected readonly inventoryOpen = signal(false);
  protected readonly salesOpen = signal(false);
  @HostListener('document:keydown.escape') closeMenu(): void { this.menuOpen.set(false); }
}
