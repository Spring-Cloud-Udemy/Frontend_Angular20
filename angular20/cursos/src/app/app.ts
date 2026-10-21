import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuSidebar } from './shared/menu-sidebar/menu-sidebar';
import { SidebarPreferenceService } from './shared/menu-sidebar/sidebar-preference.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MenuSidebar, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly sidebarPreference = inject(SidebarPreferenceService);
}
