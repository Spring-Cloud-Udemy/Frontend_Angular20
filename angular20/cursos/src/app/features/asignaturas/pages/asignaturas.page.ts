import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { describeHttpError } from '../../../core/http/http-error.util';
import { FormDialogComponent } from '../../../shared/modal/modal-form.component';
import { Asignatura, AsignaturaInput } from '../models/asignatura.model';
import { AsignaturaService } from '../services/asignatura.service';

@Component({
  selector: 'app-asignaturas-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormDialogComponent],
  templateUrl: './asignaturas.html',
  styleUrl: './asignaturas.css',
})
export class AsignaturasPage {
  private readonly asignaturaService = inject(AsignaturaService);
  private readonly formBuilder = inject(FormBuilder);

  readonly asignaturas = signal<Asignatura[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly notice = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly query = signal('');
  readonly modalOpen = signal(false);
  readonly editing = signal<Asignatura | null>(null);

  readonly asignaturaForm = this.formBuilder.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    padreId: [0],
  });

  readonly filteredAsignaturas = computed(() => {
    const term = this.query().trim().toLocaleLowerCase();
    if (!term) {
      return this.asignaturas();
    }

    return this.asignaturas().filter((asignatura) => {
      const padre = asignatura.padre?.nombre ?? '';
      return `${asignatura.nombre} ${padre}`.toLocaleLowerCase().includes(term);
    });
  });

  readonly padresCount = computed(
    () => this.asignaturas().filter((asignatura) => !asignatura.padre).length,
  );

  readonly hijasCount = computed(
    () => this.asignaturas().filter((asignatura) => Boolean(asignatura.padre)).length,
  );

  readonly padresDisponibles = computed(() => {
    const editingId = this.editing()?.id;
    return this.asignaturas().filter(
      (asignatura) => !asignatura.padre && asignatura.id !== editingId,
    );
  });

  constructor() {
    this.cargarAsignaturas();
  }

  cargarAsignaturas(): void {
    this.loading.set(true);
    this.error.set(null);
    this.asignaturaService
      .listar()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (asignaturas) => this.asignaturas.set(asignaturas),
        error: (error: unknown) => this.error.set(describeHttpError(error)),
      });
  }

  onSearchInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  openCreate(): void {
    this.formError.set(null);
    this.editing.set(null);
    this.asignaturaForm.reset({ nombre: '', padreId: 0 });
    this.modalOpen.set(true);
  }

  openEdit(asignatura: Asignatura): void {
    this.formError.set(null);
    this.editing.set(asignatura);
    this.asignaturaForm.reset({
      nombre: asignatura.nombre,
      padreId: asignatura.padre?.id ?? 0,
    });
    this.modalOpen.set(true);
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
        ? this.asignaturaService.crear(payload)
        : this.asignaturaService.editar(editing.id, payload);

    request$.pipe(finalize(() => this.saving.set(false))).subscribe({
      next: (asignatura) => {
        this.asignaturas.update((current) => {
          if (editing?.id === undefined) {
            return [asignatura, ...current];
          }
          return current.map((item) => (item.id === editing.id ? asignatura : item));
        });
        this.modalOpen.set(false);
        this.editing.set(null);
        this.notice.set(
          editing?.id === undefined
            ? 'La asignatura se creó correctamente.'
            : 'Los datos de la asignatura se actualizaron.',
        );
      },
      error: (error: unknown) => this.formError.set(describeHttpError(error)),
    });
  }

  eliminar(asignatura: Asignatura): void {
    if (
      asignatura.id === undefined ||
      !window.confirm(`¿Eliminar la asignatura "${asignatura.nombre}"? Esta acción no se puede deshacer.`)
    ) {
      return;
    }

    this.deletingId.set(asignatura.id);
    this.error.set(null);
    this.notice.set(null);
    this.asignaturaService
      .eliminar(asignatura.id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        next: () => {
          this.asignaturas.update((current) => current.filter((item) => item.id !== asignatura.id));
          this.notice.set('La asignatura se eliminó correctamente.');
        },
        error: (error: unknown) => this.error.set(describeHttpError(error)),
      });
  }

  esPadre(asignatura: Asignatura): boolean {
    return !asignatura.padre;
  }

  private buildPayload(): AsignaturaInput | null {
    const nombre = this.asignaturaForm.controls.nombre.value.trim();
    const padreId = Number(this.asignaturaForm.controls.padreId.value) || null;

    if (this.asignaturaForm.invalid || !nombre) {
      this.asignaturaForm.controls.nombre.markAsTouched();
      return null;
    }

    return { nombre, padreId };
  }
}
