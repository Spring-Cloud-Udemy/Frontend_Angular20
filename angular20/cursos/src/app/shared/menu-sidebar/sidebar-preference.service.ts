import { isPlatformBrowser } from '@angular/common';
import { afterNextRender, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';

const SIDEBAR_PREFERENCE_KEY = 'cursos.sidebar.visible';
const SIDEBAR_COLLAPSED_KEY = 'cursos.sidebar.collapsed';

@Injectable({ providedIn: 'root' })
export class SidebarPreferenceService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly visible = signal(true);
  readonly collapsed = signal(false);

  constructor() {
    if (!this.isBrowser) {
      return;
    }

    afterNextRender(() => {
      const savedPreference = localStorage.getItem(SIDEBAR_PREFERENCE_KEY);
      if (savedPreference === 'true' || savedPreference === 'false') {
        this.visible.set(savedPreference === 'true');
      }

      this.collapsed.set(localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true');
    });
  }

  setVisible(visible: boolean): void {
    this.visible.set(visible);
    if (this.isBrowser) {
      localStorage.setItem(SIDEBAR_PREFERENCE_KEY, String(visible));
    }
  }

  setCollapsed(collapsed: boolean): void {
    this.collapsed.set(collapsed);
    if (this.isBrowser) {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    }
  }

  toggleCollapsed(): void {
    this.setCollapsed(!this.collapsed());
  }
}
