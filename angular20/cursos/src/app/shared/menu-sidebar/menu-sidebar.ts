import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { describeHttpError } from '../../core/http/http-error.util';
import { AlumnoService } from '../../features/alumno/services/alumno.service';
import { CursosService } from '../../features/cursos/services/cursos.service';
import { SidebarPreferenceService } from './sidebar-preference.service';

@Component({
  selector: 'app-menu-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu-sidebar.html',
  styleUrl: './menu-sidebar.css',
})
export class MenuSidebar {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly alumnoService = inject(AlumnoService);
  private readonly cursosService = inject(CursosService);

  readonly preference = inject(SidebarPreferenceService);
  readonly alumnoCount = signal<number | null>(null);
  readonly cursoCount = signal<number | null>(null);
  readonly countError = signal<string | null>(null);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.alumnoService.list().subscribe({
      next: (alumnos) => this.alumnoCount.set(alumnos.length),
      error: (error: unknown) => this.countError.set(describeHttpError(error)),
    });
    this.cursosService.listar().subscribe({
      next: (cursos) => this.cursoCount.set(cursos.length),
      error: (error: unknown) => this.countError.set(describeHttpError(error)),
    });
  }
}