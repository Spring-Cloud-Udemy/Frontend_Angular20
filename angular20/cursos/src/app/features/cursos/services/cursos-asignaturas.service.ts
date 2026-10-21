import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, forkJoin, switchMap } from 'rxjs';

import { API_ENDPOINTS } from '../../../core/config/api.config';
import { describeHttpError } from '../../../core/http/http-error.util';
import { AsignaturaCurso } from '../../cursos-detalle/models/asignatura-curso.model';

@Injectable({ providedIn: 'root' })
export class CursosAsignaturasService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = API_ENDPOINTS.cursos;

  readonly asignaturas = signal<AsignaturaCurso[]>([]);
  readonly disponibles = signal<AsignaturaCurso[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly notice = signal<string | null>(null);

  cargar(cursoId: number): void {
    this.loading.set(true);
    this.actionError.set(null);
    this.notice.set(null);
    this.cargarListas(cursoId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ asignaturas, disponibles }) => {
          this.asignaturas.set(asignaturas);
          this.disponibles.set(disponibles);
        },
        error: (error: unknown) => this.actionError.set(describeHttpError(error)),
      });
  }

  agregar(cursoId: number, asignaturaIds: number[]): void {
    this.ejecutar(
      cursoId,
      this.http.post(`${this.endpoint}/${cursoId}/asignaturas`, { asignaturaIds }),
      'Asignaturas añadidas al curso.',
    );
  }

  agregarPadre(cursoId: number, padreId: number): void {
    this.ejecutar(
      cursoId,
      this.http.post(`${this.endpoint}/${cursoId}/asignaturas/padre/${padreId}`, {}),
      'Asignaturas del grupo añadidas al curso.',
    );
  }

  quitar(cursoId: number, asignaturaId: number): void {
    this.ejecutar(
      cursoId,
      this.http.delete(`${this.endpoint}/${cursoId}/asignaturas/${asignaturaId}`),
      'Asignatura quitada del curso.',
    );
  }

  quitarPadre(cursoId: number, padreId: number): void {
    this.ejecutar(
      cursoId,
      this.http.delete(`${this.endpoint}/${cursoId}/asignaturas/padre/${padreId}`),
      'Asignaturas del grupo quitadas del curso.',
    );
  }

  private ejecutar(cursoId: number, accion: Observable<unknown>, mensaje: string): void {
    this.saving.set(true);
    this.actionError.set(null);
    this.notice.set(null);
    accion
      .pipe(
        switchMap(() => this.cargarListas(cursoId)),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: ({ asignaturas, disponibles }) => {
          this.asignaturas.set(asignaturas);
          this.disponibles.set(disponibles);
          this.notice.set(mensaje);
        },
        error: (error: unknown) => this.actionError.set(describeHttpError(error)),
      });
  }

  private cargarListas(cursoId: number) {
    return forkJoin({
      asignaturas: this.http.get<AsignaturaCurso[]>(`${this.endpoint}/${cursoId}/asignaturas`),
      disponibles: this.http.get<AsignaturaCurso[]>(
        `${this.endpoint}/${cursoId}/asignaturas/disponibles`,
      ),
    });
  }
}
