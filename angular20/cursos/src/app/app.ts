import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Alumno } from './models/alumno';
import { AlumnoService } from './services/alumno.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly alumnosService = inject(AlumnoService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly platformId = inject(PLATFORM_ID);

  readonly alumnos = signal<Alumno[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly deletingId = signal<number | null>(null);
  readonly query = signal('');
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly notice = signal<string | null>(null);
  readonly formOpen = signal(false);
  readonly editingId = signal<number | null>(null);

  readonly filteredAlumnos = computed(() => {
    const term = this.query().trim().toLocaleLowerCase();
    if (!term) {
      return this.alumnos();
    }

    return this.alumnos().filter((alumno) =>
      `${alumno.nombre} ${alumno.apellido} ${alumno.email}`.toLocaleLowerCase().includes(term),
    );
  });

  readonly alumnoForm = this.formBuilder.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAlumnos();
    }
  }

  loadAlumnos(): void {
    this.loading.set(true);
    this.error.set(null);

    this.alumnosService.list().subscribe({
      next: (alumnos) => {
        this.alumnos.set(alumnos);
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.error.set(this.describeError(error));
        this.loading.set(false);
      },
    });
  }

  onSearchInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  openCreate(): void {
    this.editingId.set(null);
    this.formError.set(null);
    this.alumnoForm.reset({ nombre: '', apellido: '', email: '' });
    this.formOpen.set(true);
  }

  openEdit(alumno: Alumno): void {
    this.editingId.set(alumno.id);
    this.formError.set(null);
    this.alumnoForm.reset({
      nombre: alumno.nombre,
      apellido: alumno.apellido,
      email: alumno.email,
    });
    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving()) {
      return;
    }
    this.formOpen.set(false);
  }

  saveAlumno(): void {
    if (this.alumnoForm.invalid) {
      this.alumnoForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.formError.set(null);
    const changes = this.alumnoForm.getRawValue();
    const id = this.editingId();
    const request = id === null
      ? this.alumnosService.create(changes)
      : this.alumnosService.update(id, changes);

    request.subscribe({
      next: (alumno) => {
        if (id === null) {
          this.alumnos.update((current) => [alumno, ...current]);
          this.notice.set('El alumno se registró correctamente.');
        } else {
          this.alumnos.update((current) =>
            current.map((item) => item.id === id ? alumno : item),
          );
          this.notice.set('Los datos del alumno se actualizaron.');
        }
        this.saving.set(false);
        this.formOpen.set(false);
      },
      error: (error: unknown) => {
        this.formError.set(this.describeError(error));
        this.saving.set(false);
      },
    });
  }

  deleteAlumno(alumno: Alumno): void {
    if (!window.confirm(`¿Eliminar a ${alumno.nombre} ${alumno.apellido} del directorio?`)) {
      return;
    }

    this.deletingId.set(alumno.id);
    this.error.set(null);
    this.alumnosService.delete(alumno.id).subscribe({
      next: () => {
        this.alumnos.update((current) => current.filter((item) => item.id !== alumno.id));
        this.notice.set('El alumno se eliminó del directorio.');
        this.deletingId.set(null);
      },
      error: (error: unknown) => {
        this.error.set(this.describeError(error));
        this.deletingId.set(null);
      },
    });
  }

  initials(alumno: Alumno): string {
    return `${alumno.nombre.charAt(0)}${alumno.apellido.charAt(0)}`.toLocaleUpperCase();
  }

  formInitials(): string {
    const { nombre, apellido } = this.alumnoForm.getRawValue();
    return `${nombre.charAt(0) || 'N'}${apellido.charAt(0) || 'A'}`.toLocaleUpperCase();
  }

  avatarClass(id: number): string {
    return `avatar-tone-${Math.abs(id) % 5}`;
  }

  private describeError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
    }

    if (error.status === 0) {
      return 'Verifica que el gateway Spring Cloud esté activo en http://localhost:8090.';
    }

    if (typeof error.error === 'string' && error.error.trim()) {
      return error.error;
    }

    if (error.error && typeof error.error === 'object') {
      const messages = Object.values(error.error as Record<string, unknown>)
        .filter((value): value is string => typeof value === 'string');
      if (messages.length) {
        return messages.join(' ');
      }
    }

    return `El backend respondió con el estado ${error.status}. Inténtalo de nuevo.`;
  }
}
