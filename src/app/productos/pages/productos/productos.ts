import { Component, computed, inject } from '@angular/core';
import { ProfileStore } from '../../../auth/stores/profile.store';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.html',
  styleUrl: './productos.css',
})
export class Productos {
  private readonly profileStore = inject(ProfileStore);
  protected readonly isAdmin = computed(() => this.profileStore.profile()?.role === 'ADMIN');
}
