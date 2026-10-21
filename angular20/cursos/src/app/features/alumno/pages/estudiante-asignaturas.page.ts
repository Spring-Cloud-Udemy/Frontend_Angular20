import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { describeHttpError } from '../../../core/http/http-error.util';
import { AsignaturaCurso } from '../../cursos-detalle/models/asignatura-curso.model';
import { Examen } from '../../examen/models/examen.model';
import { ExamenService } from '../../examen/services/examen.service';

@Component({
  selector: 'app-estudiante-asignaturas-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './estudiante-asignaturas.html',
  styleUrl: './estudiante-asignaturas.css',
})
export class EstudianteAsignaturasPage {
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly examenService = inject(ExamenService);
  readonly estudianteId = Number(this.route.snapshot.paramMap.get('id'));

  readonly asignaturas = signal<AsignaturaCurso[]>([]);
  readonly examenes = signal<Examen[]>([]);
  readonly asignaturaSeleccionada = signal<AsignaturaCurso | null>(null);
  readonly loading = signal(false);
  readonly loadingExamenes = signal(false);
  readonly error = signal<string | null>(null);
  readonly examenesError = signal<string | null>(null);

  constructor() {
    if (!Number.isSafeInteger(this.estudianteId) || this.estudianteId < 1) {
      this.error.set('El identificador del estudiante no es válido.');
    } else if (isPlatformBrowser(this.platformId)) {
      this.cargarAsignaturas();
    }
  }

  cargarAsignaturas(): void {
    this.loading.set(true);
    this.error.set(null);
    this.examenService
      .obtenerAsignaturasEstudiante(this.estudianteId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (asignaturas) => this.asignaturas.set(asignaturas),
        error: (error: unknown) => this.error.set(describeHttpError(error)),
      });
  }

  seleccionarAsignatura(asignatura: AsignaturaCurso): void {
    this.asignaturaSeleccionada.set(asignatura);
    this.loadingExamenes.set(true);
    this.examenesError.set(null);
    this.examenes.set([]);
    this.examenService
      .obtenerExamenesEstudiante(this.estudianteId, asignatura.id)
      .pipe(finalize(() => this.loadingExamenes.set(false)))
      .subscribe({
        next: (examenes) => this.examenes.set(examenes),
        error: (error: unknown) => this.examenesError.set(describeHttpError(error)),
      });
  }
}
