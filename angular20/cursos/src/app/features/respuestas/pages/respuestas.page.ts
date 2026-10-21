import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { describeHttpError } from '../../../core/http/http-error.util';
import { Alumno } from '../../alumno/models/alumno.model';
import { AlumnoService } from '../../alumno/services/alumno.service';
import { Asignatura } from '../../asignaturas/models/asignatura.model';
import { AsignaturaService } from '../../asignaturas/services/asignatura.service';
import { CursosService } from '../../cursos/services/cursos.service';
import { Examen, Pregunta } from '../../examen/models/examen.model';
import { ExamenService } from '../../examen/services/examen.service';
import { Respuesta, RespuestaInput } from '../models/respuesta.model';
import { RespuestasService } from '../services/respuestas.service';

@Component({
  selector: 'app-respuestas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './respuestas.html',
  styleUrl: './respuestas.css',
})
export class RespuestasPage {
  private readonly respuestasService = inject(RespuestasService);
  private readonly asignaturaService = inject(AsignaturaService);
  private readonly alumnoService = inject(AlumnoService);
  private readonly cursosService = inject(CursosService);
  private readonly examenService = inject(ExamenService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly respuestas = signal<Respuesta[]>([]);
  readonly asignaturas = signal<Asignatura[]>([]);
  readonly alumnos = signal<Alumno[]>([]);
  readonly alumnosAsignatura = signal<Alumno[]>([]);
  readonly examenes = signal<Examen[]>([]);
  readonly preguntas = signal<Pregunta[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly notice = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly query = signal('');
  readonly filtroAsignaturaId = signal(0);
  readonly filtroAlumnoId = signal(0);
  readonly formAsignaturaId = signal(0);
  readonly modalOpen = signal(false);
  readonly selectedRespuesta = signal<Respuesta | null>(null);
  readonly editing = signal<Respuesta | null>(null);

  private hydrating = false;

  readonly respuestaForm = this.formBuilder.nonNullable.group({
    asignaturaId: [0, [Validators.required, Validators.min(1)]],
    alumnoId: [0, [Validators.required, Validators.min(1)]],
    examenId: [0, [Validators.required, Validators.min(1)]],
    preguntaId: [0, [Validators.required, Validators.min(1)]],
    texto: ['', [Validators.required, Validators.minLength(1)]],
  });

  readonly hijas = computed(() => this.flattenHijas(this.asignaturas()));

  readonly examenesDeAsignatura = computed(() => {
    const asignaturaId = this.formAsignaturaId();
    if (!asignaturaId) {
      return [];
    }
    return this.examenes().filter((examen) => examen.asignatura?.id === asignaturaId);
  });

  readonly filteredRespuestas = computed(() => {
    const term = this.query().trim().toLocaleLowerCase();
    const asignaturaId = this.filtroAsignaturaId();
    const alumnoId = this.filtroAlumnoId();

    return this.respuestas().filter((respuesta) => {
      if (asignaturaId && respuesta.asignaturaId !== asignaturaId) {
        return false;
      }
      if (alumnoId && respuesta.alumnoId !== alumnoId) {
        return false;
      }
      if (!term) {
        return true;
      }
      const alumno = this.nombreAlumno(respuesta.alumnoId).toLocaleLowerCase();
      const asignatura = this.nombreAsignatura(respuesta.asignaturaId).toLocaleLowerCase();
      const pregunta = this.textoPregunta(respuesta.preguntaId).toLocaleLowerCase();
      return `${respuesta.texto} ${alumno} ${asignatura} ${pregunta}`.includes(term);
    });
  });

  constructor() {
    this.respuestaForm.controls.asignaturaId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((asignaturaId) => {
        const id = Number(asignaturaId) || 0;
        this.formAsignaturaId.set(id);
        this.onAsignaturaFormChange(id);
      });
    this.respuestaForm.controls.examenId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((examenId) => {
        if (!this.hydrating) {
          this.respuestaForm.controls.preguntaId.setValue(0, { emitEvent: false });
        }
        this.cargarPreguntas(Number(examenId) || 0);
      });
    this.cargarCatalogos();
    this.cargarRespuestas();
  }

  cargarCatalogos(): void {
    this.asignaturaService.listar().subscribe({
      next: (asignaturas) => this.asignaturas.set(asignaturas ?? []),
      error: (error: unknown) => this.error.set(describeHttpError(error)),
    });
    this.alumnoService.list().subscribe({
      next: (alumnos) => this.alumnos.set(Array.isArray(alumnos) ? alumnos : []),
      error: (error: unknown) => this.error.set(describeHttpError(error)),
    });
    this.examenService.listar().subscribe({
      next: (examenes) => this.examenes.set(Array.isArray(examenes) ? examenes : []),
      error: (error: unknown) => this.error.set(describeHttpError(error)),
    });
  }

  cargarRespuestas(): void {
    this.loading.set(true);
    this.error.set(null);
    const asignaturaId = this.filtroAsignaturaId();
    const alumnoId = this.filtroAlumnoId();
    const request$ =
      asignaturaId && alumnoId
        ? this.respuestasService.listarPorAsignaturaYAlumno(asignaturaId, alumnoId)
        : asignaturaId
          ? this.respuestasService.listarPorAsignatura(asignaturaId)
          : this.respuestasService.listar();

    request$.pipe(finalize(() => this.loading.set(false))).subscribe({
      next: (respuestas) => {
        this.respuestas.set(respuestas ?? []);
        const selectedId = this.selectedRespuesta()?.id;
        this.selectedRespuesta.set(respuestas.find((item) => item.id === selectedId) ?? null);
      },
      error: (error: unknown) => this.error.set(describeHttpError(error)),
    });
  }

  onSearchInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  onFiltroAsignatura(event: Event): void {
    const asignaturaId = Number((event.target as HTMLSelectElement).value) || 0;
    this.filtroAsignaturaId.set(asignaturaId);
    this.filtroAlumnoId.set(0);
    this.selectedRespuesta.set(null);
    if (asignaturaId) {
      this.cursosService.obtenerAlumnosPorAsignatura(asignaturaId).subscribe({
        next: (alumnos) => this.alumnosAsignatura.set(alumnos ?? []),
        error: () => this.alumnosAsignatura.set([]),
      });
    } else {
      this.alumnosAsignatura.set([]);
    }
    this.cargarRespuestas();
  }

  onFiltroAlumno(event: Event): void {
    this.filtroAlumnoId.set(Number((event.target as HTMLSelectElement).value) || 0);
    this.selectedRespuesta.set(null);
    this.cargarRespuestas();
  }

  seleccionarRespuesta(respuesta: Respuesta): void {
    this.selectedRespuesta.set(respuesta);
    this.actionError.set(null);
  }

  openCreate(): void {
    this.formError.set(null);
    this.editing.set(null);
    this.preguntas.set([]);
    this.hydrating = true;
    this.respuestaForm.reset({
      asignaturaId: this.filtroAsignaturaId(),
      alumnoId: this.filtroAlumnoId(),
      examenId: 0,
      preguntaId: 0,
      texto: '',
    });
    this.hydrating = false;
    this.modalOpen.set(true);
  }

  openEdit(respuesta?: Respuesta): void {
    const target = respuesta ?? this.selectedRespuesta();
    if (!target?.id) {
      return;
    }

    this.formError.set(null);
    this.editing.set(target);
    this.hydrating = true;
    this.respuestaForm.reset({
      asignaturaId: target.asignaturaId,
      alumnoId: target.alumnoId,
      examenId: target.examenId ?? 0,
      preguntaId: target.preguntaId,
      texto: target.texto,
    });
    this.hydrating = false;
    this.modalOpen.set(true);

    if (!target.examenId && target.preguntaId) {
      this.examenService.obtenerPorPregunta(target.preguntaId).subscribe({
        next: (examen) => {
          this.hydrating = true;
          this.respuestaForm.controls.examenId.setValue(examen.id);
          this.preguntas.set(examen.preguntas ?? []);
          this.hydrating = false;
        },
      });
    }
  }

  closeModal(): void {
    if (!this.saving()) {
      this.modalOpen.set(false);
      this.editing.set(null);
    }
  }

  guardar(): void {
    const payload = this.buildPayload();
    if (!payload) {
      return;
    }

    const editing = this.editing();
    this.saving.set(true);
    this.formError.set(null);
    const request$ =
      editing?.id === undefined
        ? this.respuestasService.crear(payload)
        : this.respuestasService.editar(editing.id, payload);

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (respuesta) => {
        this.respuestas.update((current) => {
          if (editing?.id === undefined) {
            return [respuesta, ...current];
          }
          return current.map((item) => (item.id === editing.id ? respuesta : item));
        });
        this.selectedRespuesta.set(respuesta);
        this.modalOpen.set(false);
        this.editing.set(null);
        this.notice.set(
          editing?.id === undefined
            ? 'La respuesta individual se creó correctamente.'
            : 'La respuesta se actualizó correctamente.',
        );
      },
      error: (error: unknown) => this.formError.set(describeHttpError(error)),
    });
  }

  eliminar(respuesta: Respuesta | null = this.selectedRespuesta()): void {
    if (
      !respuesta?.id ||
      !window.confirm('¿Eliminar esta respuesta? Esta acción no se puede deshacer.')
    ) {
      return;
    }

    this.deleting.set(true);
    this.error.set(null);
    this.actionError.set(null);
    this.notice.set(null);
    this.respuestasService
      .eliminar(respuesta.id)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: () => {
          this.respuestas.update((current) => current.filter((item) => item.id !== respuesta.id));
          if (this.selectedRespuesta()?.id === respuesta.id) {
            this.selectedRespuesta.set(null);
          }
          this.notice.set('La respuesta se eliminó correctamente.');
        },
        error: (error: unknown) => this.actionError.set(describeHttpError(error)),
      });
  }

  nombreAlumno(alumnoId: number): string {
    const alumno =
      this.alumnosAsignatura().find((item) => item.id === alumnoId) ??
      this.alumnos().find((item) => item.id === alumnoId);
    return alumno ? `${alumno.nombre} ${alumno.apellido}` : `Estudiante #${alumnoId}`;
  }

  nombreAsignatura(asignaturaId: number): string {
    const asignatura =
      this.hijas().find((item) => item.id === asignaturaId) ??
      this.asignaturas().find((item) => item.id === asignaturaId);
    if (!asignatura) {
      return `Asignatura #${asignaturaId}`;
    }
    return asignatura.padre ? `${asignatura.padre.nombre} / ${asignatura.nombre}` : asignatura.nombre;
  }

  textoPregunta(preguntaId: number): string {
    const pregunta = this.preguntas().find((item) => item.id === preguntaId);
    if (pregunta) {
      return pregunta.texto;
    }
    for (const examen of this.examenes()) {
      const encontrada = examen.preguntas?.find((item) => item.id === preguntaId);
      if (encontrada) {
        return encontrada.texto;
      }
    }
    return `Pregunta #${preguntaId}`;
  }

  invalid(controlName: 'asignaturaId' | 'alumnoId' | 'examenId' | 'preguntaId' | 'texto'): boolean {
    const control = this.respuestaForm.controls[controlName];
    return control.touched && control.invalid;
  }

  private onAsignaturaFormChange(asignaturaId: number): void {
    if (!this.hydrating) {
      this.respuestaForm.patchValue({ alumnoId: 0, examenId: 0, preguntaId: 0 }, { emitEvent: false });
      this.preguntas.set([]);
    }
    if (!asignaturaId) {
      this.alumnosAsignatura.set([]);
      return;
    }
    this.cursosService.obtenerAlumnosPorAsignatura(asignaturaId).subscribe({
      next: (alumnos) => this.alumnosAsignatura.set(alumnos ?? []),
      error: () => this.alumnosAsignatura.set([]),
    });
  }

  private cargarPreguntas(examenId: number): void {
    if (!examenId) {
      this.preguntas.set([]);
      return;
    }
    const local = this.examenes().find((examen) => examen.id === examenId);
    if (local?.preguntas?.length) {
      this.preguntas.set(local.preguntas);
      return;
    }
    this.examenService.ver(examenId).subscribe({
      next: (examen) => this.preguntas.set(examen.preguntas ?? []),
      error: () => this.preguntas.set([]),
    });
  }

  private flattenHijas(items: Asignatura[]): Asignatura[] {
    const hijas: Asignatura[] = [];
    const seen = new Set<number>();
    const walk = (nodos: Asignatura[], padre?: Asignatura): void => {
      for (const nodo of nodos ?? []) {
        const withPadre: Asignatura =
          nodo.padre || !padre
            ? nodo
            : { ...nodo, padre: { id: padre.id, nombre: padre.nombre } };
        if (withPadre.padre && !seen.has(withPadre.id)) {
          seen.add(withPadre.id);
          hijas.push(withPadre);
        }
        if (nodo.hijos?.length) {
          walk(nodo.hijos as Asignatura[], nodo);
        }
      }
    };
    walk(items);
    return hijas;
  }

  private buildPayload(): RespuestaInput | null {
    this.respuestaForm.markAllAsTouched();
    if (this.respuestaForm.invalid) {
      this.formError.set('Completa asignatura hija, estudiante, examen, pregunta y texto.');
      return null;
    }

    return {
      texto: this.respuestaForm.controls.texto.value.trim(),
      asignaturaId: Number(this.respuestaForm.controls.asignaturaId.value),
      alumnoId: Number(this.respuestaForm.controls.alumnoId.value),
      preguntaId: Number(this.respuestaForm.controls.preguntaId.value),
      examenId: Number(this.respuestaForm.controls.examenId.value) || null,
    };
  }
}
