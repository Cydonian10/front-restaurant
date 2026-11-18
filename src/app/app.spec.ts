import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should switch and save the theme', async () => {
    const values = new Map<string, string>([['theme', 'vasquez-dark']]);
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(document.documentElement.getAttribute('data-theme')).toBe('vasquez-dark');
    compiled.querySelector('button')?.click();
    expect(document.documentElement.getAttribute('data-theme')).toBe('vasquez-light');
    expect(values.get('theme')).toBe('vasquez-light');
  });
});
