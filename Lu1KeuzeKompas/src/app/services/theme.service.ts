import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app_theme';
  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;

  // Signal voor reactive theme state
  currentTheme = signal<Theme>('light');

  constructor() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      this.loadTheme();
      
      // Effect om theme class toe te passen op document
      effect(() => {
        const theme = this.currentTheme();
        document.documentElement.setAttribute('data-theme', theme);
      });
    }
  }

  // Load theme van localStorage of system preference
  private loadTheme(): void {
    if (!this.isBrowser) return;

    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    
    if (savedTheme) {
      this.currentTheme.set(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme.set(prefersDark ? 'dark' : 'light');
    }
  }

  // Toggle tussen light en dark mode
  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  // Set specifieke theme
  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    
    if (this.isBrowser) {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }

  // Get current theme
  getTheme(): Theme {
    return this.currentTheme();
  }

  // Check of dark mode actief is
  isDarkMode(): boolean {
    return this.currentTheme() === 'dark';
  }
}