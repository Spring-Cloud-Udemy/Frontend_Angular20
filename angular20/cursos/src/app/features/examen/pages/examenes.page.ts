import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { describeHttpError } from '../../../core/http/http-error.util';
import { FormDialogComponent } from '../../../shared/modal/modal-form.component';
import { AsignaturaCurso } from '../../asignaturas/models/asignatura-curso.model';
import {
  EXAMEN_NOMBRE_MAX,
  EXAMEN_NOMBRE_MIN,
  Examen,
  ExamenInput,
  PreguntaInput,
} from '../models/examen.model';
import { ExamenService } from '../services/examen.service';

@Component({
  selector: 'app-examenes-page',
  imports: [CommonModule, ReactiveFormsModule, FormDialogComponent],
  templateUrl: './examenes.html',
  styleUrl: './examenes.css',
})
export class ExamenesPage {
  private readonly examenService = inject(ExamenService);
  private readonly formBuilder = inject(FormBuilder);

  readonly examenes = signal<Examen[]>([]);
  readonly asignaturas = signal<{ id: number; nombre: string }[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly createOpen = signal(false);
  readonly deleting = signal(false);
  readonly selectedExamen = signal<Examen | null>(null);
  readonly editingExamen = signal<Examen | null>(null);
  readonly query = signal('');

  readonly examenForm = this.formBuilder.nonNullable.group({
    nombre: [
      '',
      [Validators.required, Validators.minLength(EXAMEN_NOMBRE_MIN), Validators.maxLength(EXAMEN_NOMBRE_MAX)],
    ],
    asignaturaId: [0, [Validators.required, Validators.min(1)]],
    preguntas: ['', Validators.required],
  });

  readonly filteredExamenes = computed(() => {
    const term = this.query().trim().toLocaleLowerCase();
    if (!term) {
      return this.examenes();
    }

    return this.examenes().filter((examen) => {
      const asignatura = examen.asignatura?.nombre ?? '';
      return `${examen.nombre} ${asignatura}`.toLocaleLowerCase().includes(term);
    });
  });

  constructor() {
    this.cargarExamenes();
    this.cargarAsignaturas();
  }

  cargarExamenes(): void {
    this.loading.set(true);
    this.error.set(null);
    this.examenService
      .listar()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (examenes) => {
          this.examenes.set(examenes);
          const selectedId = this.selectedExamen()?.id;
          this.selectedExamen.set(examenes.find((examen) => examen.id === selectedId) ?? null);
        },
        error: (error: unknown) => this.error.set(describeHttpError(error)),
      });
  }

  onSearchInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  openCreate(): void {
    this.formError.set(null);
    this.editingExamen.set(null);
    this.examenForm.reset({ nombre: '', asignaturaId: 0, preguntas: '' });
    this.createOpen.set(true);
  }

  seleccionarExamen(examen: Examen): void {
    this.selectedExamen.set(examen);
    this.actionError.set(null);
  }

  openEdit(): void {
    const examen = this.selectedExamen();
    if (examen?.id === undefined) {
      return;
    }

    this.formError.set(null);
    this.editingExamen.set(examen);
    this.examenForm.reset({
      nombre: examen.nombre,
      asignaturaId: examen.asignatura?.id ?? 0,
      preguntas: (examen.preguntas ?? []).map((pregunta) => pregunta.texto).join('\n'),
    });
    this.createOpen.set(true);
  }

  closeCreate(): void {
    if (!this.saving()) {
      this.createOpen.set(false);
      this.editingExamen.set(null);
    }
  }

  submitExamen(): void {
    if (this.editingExamen()) {
      this.guardarExamen();
      return;
    }
    this.crearExamen();
  }

  crearExamen(): void {
    const payload = this.buildPayload();
    if (!payload) {
      return;
    }

    this.saving.set(true);
    this.formError.set(null);
    this.examenService
      .crearExamen(payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (examen) => {
          this.examenes.update((current) => [examen, ...current]);
          this.selectedExamen.set(examen);
          this.createOpen.set(false);
          this.notice.set('El examen se creó correctamente.');
        },
        error: (error: unknown) => this.formError.set(describeHttpError(error)),
      });
  }

  guardarExamen(): void {
    const examen = this.editingExamen();
    const payload = this.buildPayload(examen);
    if (!examen || examen.id === undefined || !payload) {
      return;
    }

    this.saving.set(true);
    this.formError.set(null);
    this.examenService
      .editarExamen(examen.id, payload)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (actualizado) => {
          this.examenes.update((current) =>
            current.map((item) => (item.id === examen.id ? actualizado : item)),
          );
          this.selectedExamen.set(actualizado);
          this.editingExamen.set(null);
          this.createOpen.set(false);
          this.notice.set('Los datos del examen se actualizaron.');
        },
        error: (error: unknown) => this.formError.set(describeHttpError(error)),
      });
  }

  eliminarExamen(): void {
    const examen = this.selectedExamen();
    if (
      examen?.id === undefined ||
      !window.confirm(`¿Eliminar el examen "${examen.nombre}"? Esta acción no se puede deshacer.`)
    ) {
      return;
    }

    this.deleting.set(true);
    this.actionError.set(null);
    this.notice.set(null);
    this.examenService
      .eliminar(examen.id)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: () => {
          this.examenes.update((current) => current.filter((item) => item.id !== examen.id));
          this.selectedExamen.set(null);
          this.notice.set('El examen se eliminó correctamente.');
        },
        error: (error: unknown) => this.actionError.set(describeHttpError(error)),
      });
  }

  preguntaCount(examen: Examen): number {
    return examen.preguntas?.length ?? 0;
  }

  private cargarAsignaturas(): void {
    this.examenService.listarAsignaturas().subscribe({
      next: (asignaturas) => this.asignaturas.set(this.hojasAsignatura(asignaturas)),
      error: () => this.asignaturas.set([]),
    });
  }

  private hojasAsignatura(nodos: AsignaturaCurso[]): { id: number; nombre: string }[] {
    const hojas: { id: number; nombre: string }[] = [];
    const seen = new Set<number>();
    const walk = (items: AsignaturaCurso[]): void => {
      for (const nodo of items ?? []) {
        if (nodo.hijos?.length) {
          walk(nodo.hijos);
          continue;
        }
        if (!seen.has(nodo.id)) {
          seen.add(nodo.id);
          hojas.push({ id: nodo.id, nombre: nodo.nombre });
        }
      }
    };
    walk(nodos);
    return hojas;
  }

  private buildPayload(examen?: Examen | null): ExamenInput | null {
    const nombre = this.examenForm.controls.nombre.value.trim();
    const asignaturaId = Number(this.examenForm.controls.asignaturaId.value);
    const textos = this.examenForm.controls.preguntas.value
      .split('\n')
      .map((linea) => linea.trim())
      .filter((linea) => linea.length > 0);

    if (this.examenForm.invalid || !nombre || !asignaturaId || textos.length === 0) {
      this.examenForm.markAllAsTouched();
      return null;
    }

    const existentes = examen?.preguntas ?? [];
    const preguntas: PreguntaInput[] = textos.map((texto, index) => {
      const existente = existentes[index];
      return existente?.id === undefined ? { texto } : { id: existente.id, texto };
    });

    return {
      nombre,
      asignatura: { id: asignaturaId },
      preguntas,
    };
  }
}
