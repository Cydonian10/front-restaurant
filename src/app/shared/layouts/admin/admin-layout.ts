import { Component, HostListener, inject, signal } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { ConfirmDialog, ConfirmDialogData } from '../../components/confirm-dialog/confirm-dialog';
import { AuthService } from '../../../auth/access-control/auth.service';
import { ProfileStore } from '../../../auth/stores/profile.store';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  private readonly auth = inject(AuthService);
  private readonly dialog = inject(Dialog);
  protected readonly profileStore = inject(ProfileStore);

  constructor() {
    this.loadProfile();
  }

  protected confirmLogout(): void {
    const data: ConfirmDialogData = {
      title: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      confirmLabel: 'Cerrar sesión',
    };
    this.dialog
      .open<boolean>(ConfirmDialog, {
        data,
        ariaLabel: data.title,
        autoFocus: 'first-tabbable',
        width: '440px',
        maxWidth: 'calc(100vw - 32px)',
        panelClass: 'app-dialog-panel',
        backdropClass: 'app-dialog-backdrop',
      })
      .closed.subscribe((confirmed) => {
        if (confirmed) this.auth.logout();
      });
  }

  protected loadProfile(): void {
    this.profileStore.load().subscribe({ error: () => {} });
  }
  protected readonly menuOpen = signal(false);
  protected readonly inventoryOpen = signal(false);
  protected readonly salesOpen = signal(false);
  @HostListener('document:keydown.escape') closeMenu(): void {
    this.menuOpen.set(false);
  }
}
