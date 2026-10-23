import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { describeHttpError } from '../../../core/http/http-error.util';
import { FormDialogComponent } from '../../../shared/modal/modal-form.component';
import { Curso } from '../models/curso.model';
import { CursosService } from '../services/cursos.service';

@Component({
  selector: 'app-cursos-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormDialogComponent],
  templateUrl: './cursos.html',
  styleUrl: './cursos.css',
})
export class CursosPage {
  private readonly cursosService = inject(CursosService);
  private readonly formBuilder = inject(FormBuilder);

  readonly cursos = signal<Curso[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly createOpen = signal(false);
  readonly deleting = signal(false);
  readonly selectedCurso = signal<Curso | null>(null);
  readonly editingCurso = signal<Curso | null>(null);
  readonly query = signal('');

  readonly cursoForm = this.formBuilder.nonNullable.group({
    nombre: ['', Validators.required],
  });

  readonly filteredCursos = computed(() => {
    const term = this.query().trim().toLocaleLowerCase();
    if (!term) {
      return this.cursos();
    }

    return this.cursos().filter((curso) => curso.nombre.toLocaleLowerCase().includes(term));
  });

  constructor() {
    this.cargarCursos();
  }

  cargarCursos(): void {
    this.loading.set(true);
    this.error.set(null);
    this.cursosService
      .listar()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (cursos) => {
          this.cursos.set(cursos);
          const selectedId = this.selectedCurso()?.id;
          this.selectedCurso.set(
            cursos.find((curso) => curso.id === selectedId) ?? null,
          );
        },
        error: (error: unknown) => this.error.set(describeHttpError(error)),
      });
  }

  onSearchInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  openCreate(): void {
    this.formError.set(null);
    this.editingCurso.set(null);
    this.cursoForm.reset({ nombre: '' });
    this.createOpen.set(true);
  }

  seleccionarCurso(curso: Curso): void {
    this.selectedCurso.set(curso);
    this.actionError.set(null);
  }

  openEdit(): void {
    const curso = this.selectedCurso();
    if (curso?.id === undefined) {
      return;
    }

    this.formError.set(null);
    this.editingCurso.set(curso);
    this.cursoForm.reset({ nombre: curso.nombre });
    this.createOpen.set(true);
  }

  closeCreate(): void {
    if (!this.saving()) {
      this.createOpen.set(false);
      this.editingCurso.set(null);
    }
  }

  submitCurso(): void {
    if (this.editingCurso()) {
      this.guardarCurso();
      return;
    }
    this.crearCurso();
  }

  crearCurso(): void {
    if (this.cursoForm.invalid || !this.cursoForm.controls.nombre.value.trim()) {
      this.cursoForm.controls.nombre.markAsTouched();
      return;
    }

    this.saving.set(true);
    this.formError.set(null);
    this.cursosService
      .crear({ nombre: this.cursoForm.controls.nombre.value.trim() })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (curso) => {
          this.cursos.update((current) => [curso, ...current]);
          this.selectedCurso.set(curso);
          this.createOpen.set(false);
          this.notice.set('El curso se creó correctamente.');
        },
        error: (error: unknown) => this.formError.set(describeHttpError(error)),
      });
  }

  guardarCurso(): void {
    const curso = this.editingCurso();
    const nombre = this.cursoForm.controls.nombre.value.trim();
    if (!curso || curso.id === undefined || this.cursoForm.invalid || !nombre) {
      this.cursoForm.controls.nombre.markAsTouched();
      return;
    }

    this.saving.set(true);
    this.formError.set(null);
    this.cursosService
      .editar(curso.id, { ...curso, nombre })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (actualizado) => {
          this.cursos.update((current) =>
            current.map((item) => item.id === curso.id ? actualizado : item),
          );
          this.selectedCurso.set(actualizado);
          this.editingCurso.set(null);
          this.createOpen.set(false);
          this.notice.set('Los datos del curso se actualizaron.');
        },
        error: (error: unknown) => this.formError.set(describeHttpError(error)),
      });
  }

  eliminarCurso(): void {
    const curso = this.selectedCurso();
    if (
      curso?.id === undefined ||
      !window.confirm(`¿Eliminar el curso "${curso.nombre}"? Esta acción no se puede deshacer.`)
    ) {
      return;
    }

    this.deleting.set(true);
    this.actionError.set(null);
    this.notice.set(null);
    this.cursosService
      .eliminar(curso.id)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: () => {
          this.cursos.update((current) => current.filter((item) => item.id !== curso.id));
          this.selectedCurso.set(null);
          this.notice.set('El curso se eliminó correctamente.');
        },
        error: (error: unknown) => this.actionError.set(describeHttpError(error)),
      });
  }

  studentCount(curso: Curso): number {
    return curso.alumnos?.length ?? curso.cursoAlumnos?.length ?? 0;
  }

}
