import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-paginador',
  templateUrl: './paginador.html',
  host: { class: 'block' },
})
export class Paginador {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly pages = computed(() => {
    const total = this.totalPages();
    const current = Math.min(this.page(), total);

    if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
    if (current <= 3) return [1, 2, 3, 4, 'end-gap', total] as const;
    if (current >= total - 2) {
      return [1, 'start-gap', total - 3, total - 2, total - 1, total] as const;
    }
    return [1, 'start-gap', current - 1, current, current + 1, 'end-gap', total] as const;
  });

  protected goTo(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.page()) this.pageChange.emit(page);
  }
}
