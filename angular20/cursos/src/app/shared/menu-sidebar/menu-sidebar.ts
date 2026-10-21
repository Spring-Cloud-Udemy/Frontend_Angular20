import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { describeHttpError } from '../../core/http/http-error.util';
import { AlumnoService } from '../../features/alumno/services/alumno.service';
import { AsignaturaService } from '../../features/asignaturas/services/asignatura.service';
import { CursosService } from '../../features/cursos/services/cursos.service';
import { ExamenService } from '../../features/examen/services/examen.service';
import { RespuestasService } from '../../features/respuestas/services/respuestas.service';
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
  private readonly examenService = inject(ExamenService);
  private readonly asignaturaService = inject(AsignaturaService);
  private readonly respuestasService = inject(RespuestasService);

  readonly preference = inject(SidebarPreferenceService);
  readonly alumnoCount = signal<number | null>(null);
  readonly cursoCount = signal<number | null>(null);
  readonly countError = signal<string | null>(null);
  readonly examenCount = signal<number | null>(null);
  readonly asignaturaCount = signal<number | null>(null);
  readonly respuestaCount = this.respuestasService.count;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.alumnoService.list().subscribe({
      next: (alumnos) => {
        const count = Array.isArray(alumnos)
          ? alumnos.length
          : ((alumnos as unknown as { totalElements?: number })?.totalElements ?? 0);
        this.alumnoCount.set(count);
      },
      error: (error: unknown) => this.countError.set(describeHttpError(error)),
    });

    this.cursosService.listar().subscribe({
      next: (cursos) => {
        const count = Array.isArray(cursos)
          ? cursos.length
          : ((cursos as unknown as { totalElements?: number })?.totalElements ?? 0);
        this.cursoCount.set(count);
      },
      error: (error: unknown) => this.countError.set(describeHttpError(error)),
    });

    this.examenService.listar().subscribe({
      next: (examenes) => {
        const count = Array.isArray(examenes)
          ? examenes.length
          : ((examenes as unknown as { totalElements?: number })?.totalElements ?? 0);
        this.examenCount.set(count);
      },
      error: (error: unknown) => this.countError.set(describeHttpError(error)),
    });

    this.asignaturaService.listar().subscribe({
      next: (asignaturas) => {
        const count = Array.isArray(asignaturas)
          ? asignaturas.length
          : ((asignaturas as unknown as { totalElements?: number })?.totalElements ?? 0);
        this.asignaturaCount.set(count);
      },
      error: (error: unknown) => this.countError.set(describeHttpError(error)),
    });

    this.respuestasService.listar().subscribe({
      error: (error: unknown) => this.countError.set(describeHttpError(error)),
    });
  }
}