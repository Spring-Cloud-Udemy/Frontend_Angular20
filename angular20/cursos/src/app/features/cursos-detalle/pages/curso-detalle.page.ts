import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, finalize, forkJoin, of, switchMap } from 'rxjs';
import { DialogModule } from 'primeng/dialog';

import { describeHttpError } from '../../../core/http/http-error.util';
import { Alumno } from '../../alumno/models/alumno.model';
import { AlumnoStore } from '../../alumno/services/alumno.store';
import { Examen } from '../../examen/models/examen.model';
import { ExamenStore } from '../../examen/services/examen.store';
import { Curso } from '../../cursos/models/curso.model';
import { AsignaturaCurso } from '../../asignaturas/models/asignatura-curso.model';
import { CursosService } from '../../cursos/services/cursos.service';
import { CursosAsignaturasService } from '../../asignaturas/services/cursos-asignaturas.service';

type Pestana = 'alumnos' | 'examenes' | 'asignaturas';

@Component({
  selector: 'app-curso-detalle-page',
  standalone: true,
  imports: [CommonModule, RouterLink, DialogModule],
  templateUrl: './curso-detalle.html',
  styleUrl: './curso-detalle.css',
})
export class CursoDetallePage {
  private readonly route = inject(ActivatedRoute);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly cursosService = inject(CursosService);
  private readonly alumnoStore = inject(AlumnoStore);
  private readonly examenStore = inject(ExamenStore);
  readonly cursosAsignaturasService = inject(CursosAsignaturasService);

  private readonly cursoId = Number(this.route.snapshot.paramMap.get('id'));

  // Estado de la pantalla
  readonly curso = signal<Curso | null>(null);
  readonly cursos = signal<Curso[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly alumnosError = signal<string | null>(null);
  readonly cursosError = signal<string | null>(null);
  readonly examenesError = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly tab = signal<Pestana>('alumnos');

  // Selección múltiple en las listas de "disponibles"
  readonly alumnosSeleccionados = signal<ReadonlySet<number>>(new Set());
  readonly examenesSeleccionados = signal<ReadonlySet<number>>(new Set());
  readonly asignaturasSeleccionadas = signal<ReadonlySet<number>>(new Set());
  readonly dialogAsignaturasVisible = signal(false);

  // Lo que ya pertenece al curso
  readonly alumnosAsignados = computed(() => {
    const curso = this.curso();
    if (!curso) {
      return [];
    }
    if (curso.alumnos?.length) {
      return curso.alumnos;
    }

    const idsAsignados = new Set(curso.cursoAlumnos?.map((relacion) => relacion.alumnoId) ?? []);
    return this.alumnoStore.alumnos().filter((alumno) => idsAsignados.has(alumno.id));
  });
  readonly examenesAsignados = computed(() => this.curso()?.examenes ?? []);
  readonly totalAsignaturas = computed(() =>
    this.cursosAsignaturasService.asignaturas().reduce((total, padre) => total + padre.hijos.length, 0),
  );

  // Lo que se puede asignar: catálogo completo menos lo ya asignado
  readonly alumnosDisponibles = computed(() => {
    const ocupados = new Set(this.alumnosAsignados().map((alumno) => alumno.id));
    for (const curso of this.cursos()) {
      if (curso.id === this.cursoId) {
        continue;
      }
      for (const relacion of curso.cursoAlumnos ?? []) {
        ocupados.add(relacion.alumnoId);
      }
      for (const alumno of curso.alumnos ?? []) {
        ocupados.add(alumno.id);
      }
    }
    return this.alumnoStore.alumnos().filter((alumno) => !ocupados.has(alumno.id));
  });

  readonly examenesDisponibles = computed(() => {
    const ocupados = new Set(this.examenesAsignados().map((e) => e.id));
    return this.examenStore.examenes().filter((e) => !ocupados.has(e.id));
  });

  constructor() {
    if (!Number.isSafeInteger(this.cursoId) || this.cursoId < 1) {
      this.error.set('El identificador del curso no es válido.');
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      this.cargar();
    }
  }

  // ---------- Carga ----------

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    this.cursosAsignaturasService.cargar(this.cursoId);
    this.alumnosError.set(null);
    this.cursosError.set(null);
    this.examenesError.set(null);

    forkJoin({
      curso: this.cursosService.ver(this.cursoId),
      cursos: this.cursosService.listar().pipe(
        catchError((error: unknown) => {
          this.cursosError.set(describeHttpError(error));
          return of(null);
        }),
      ),
      alumnos: this.alumnoStore.load().pipe(
        catchError((error: unknown) => {
          this.alumnosError.set(describeHttpError(error));
          return of([]);
        }),
      ),
      examenes: this.examenStore.load().pipe(
        catchError((error: unknown) => {
          this.examenesError.set(describeHttpError(error));
          return of([]);
        }),
      ),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ curso, cursos }) => {
          this.curso.set(curso);
          if (cursos) {
            this.cursos.set(cursos);
          }
        },
        error: (e: unknown) => this.error.set(describeHttpError(e)),
      });
  }

  // ---------- Interfaz ----------

  cambiarPestana(pestana: Pestana): void {
    this.tab.set(pestana);
  }

  abrirDialogoAsignaturas(): void {
    this.asignaturasSeleccionadas.set(new Set());
    this.cursosAsignaturasService.cargar(this.cursoId);
    this.dialogAsignaturasVisible.set(true);
  }

  toggleAsignatura(id: number): void {
    this.asignaturasSeleccionadas.update((actual) => this.alternar(actual, id));
  }

  toggleAsignaturasPadre(padre: AsignaturaCurso): void {
    this.asignaturasSeleccionadas.update((actual) => {
      const copia = new Set(actual);
      const todasSeleccionadas = padre.hijos.every((hija) => copia.has(hija.id));
      for (const hija of padre.hijos) {
        if (todasSeleccionadas) {
          copia.delete(hija.id);
        } else {
          copia.add(hija.id);
        }
      }
      return copia;
    });
  }

  padreSeleccionado(padre: AsignaturaCurso): boolean {
    return padre.hijos.length > 0 && padre.hijos.every((hija) => this.asignaturasSeleccionadas().has(hija.id));
  }

  guardarAsignaturas(): void {
    const seleccionadas = [...this.asignaturasSeleccionadas()];
    if (seleccionadas.length === 0) {
      return;
    }
    this.cursosAsignaturasService.agregar(this.cursoId, seleccionadas);
    this.dialogAsignaturasVisible.set(false);
  }

  quitarAsignatura(asignatura: AsignaturaCurso): void {
    if (!window.confirm(`¿Quitar "${asignatura.nombre}" de este curso?`)) {
      return;
    }
    this.cursosAsignaturasService.quitar(this.cursoId, asignatura.id);
  }

  quitarAsignaturasPadre(padre: AsignaturaCurso): void {
    if (!window.confirm(`¿Quitar todas las asignaturas de "${padre.nombre}" de este curso?`)) {
      return;
    }
    this.cursosAsignaturasService.quitarPadre(this.cursoId, padre.id);
  }

  toggleAlumno(id: number): void {
    this.alumnosSeleccionados.update((actual) => this.alternar(actual, id));
  }

  toggleExamen(id: number): void {
    this.examenesSeleccionados.update((actual) => this.alternar(actual, id));
  }

  plural(cantidad: number, singular: string, pluralForma: string): string {
    return cantidad === 1 ? singular : pluralForma;
  }

  // ---------- Alumnos ----------

  asignarAlumnos(): void {
    const elegidos = this.alumnosDisponibles().filter((a) => this.alumnosSeleccionados().has(a.id));
    if (!elegidos.length) {
      return;
    }

    this.ejecutar(
      this.cursosService.asignarAlumnos(this.cursoId, elegidos),
      elegidos.length === 1 ? 'Alumno asignado al curso.' : `${elegidos.length} alumnos asignados al curso.`,
      () => this.alumnosSeleccionados.set(new Set()),
    );
  }

  quitarAlumno(alumno: Alumno): void {
    if (!window.confirm(`¿Quitar a ${alumno.nombre} ${alumno.apellido} de este curso?`)) {
      return;
    }

    this.ejecutar(
      this.cursosService.eliminarAlumno(this.cursoId, alumno),
      'Alumno retirado del curso.',
    );
  }

  // ---------- Exámenes ----------

  asignarExamenes(): void {
    const elegidos = this.examenesDisponibles().filter((e) => this.examenesSeleccionados().has(e.id));
    if (!elegidos.length) {
      return;
    }

    this.ejecutar(
      this.cursosService.asignarExamenes(this.cursoId, elegidos),
      elegidos.length === 1 ? 'Examen asignado al curso.' : `${elegidos.length} exámenes asignados al curso.`,
      () => this.examenesSeleccionados.set(new Set()),
    );
  }

  quitarExamen(examen: Examen): void {
    if (!window.confirm(`¿Quitar el examen "${examen.nombre}" de este curso?`)) {
      return;
    }

    this.ejecutar(
      this.cursosService.eliminarExamen(this.cursoId, examen),
      'Examen retirado del curso.',
    );
  }

  // ---------- Internos ----------

  /**
   * Ejecuta una modificación del curso y vuelve a pedirlo con ver():
   * los PUT devuelven el curso sin los alumnos completos, solo con sus ids.
   */
  private ejecutar(operacion: Observable<unknown>, mensaje: string, alExito?: () => void): void {
    this.saving.set(true);
    this.error.set(null);
    this.notice.set(null);

    operacion
      .pipe(
        switchMap(() => this.cursosService.ver(this.cursoId)),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (curso) => {
          this.curso.set(curso);
          this.cursos.update((cursos) => {
            const existe = cursos.some((item) => item.id === curso.id);
            return existe
              ? cursos.map((item) => item.id === curso.id ? curso : item)
              : [...cursos, curso];
          });
          this.notice.set(mensaje);
          alExito?.();
        },
        error: (e: unknown) => this.error.set(describeHttpError(e)),
      });
  }

  private alternar(actual: ReadonlySet<number>, id: number): ReadonlySet<number> {
    const copia = new Set(actual);
    if (copia.has(id)) {
      copia.delete(id);
    } else {
      copia.add(id);
    }
    return copia;
  }
}