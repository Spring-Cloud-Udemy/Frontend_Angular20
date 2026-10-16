import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { AlumnoInput } from '../models/alumno-input.model';
import { Alumno } from '../models/alumno.model';
import { AlumnoService } from './alumno.service';

@Injectable({ providedIn: 'root' })
export class AlumnoStore {
  private readonly api = inject(AlumnoService);

  readonly alumnos = signal<Alumno[]>([]);
  readonly loading = signal(false);
  readonly deletingId = signal<number | null>(null);

  load(): Observable<Alumno[]> {
    this.loading.set(true);
    return this.api.list().pipe(
      tap((alumnos) => this.alumnos.set(alumnos)),
      finalize(() => this.loading.set(false)),
    );
  }

  save(id: number | null, changes: AlumnoInput): Observable<Alumno> {
    const request = id === null
      ? this.api.create(changes)
      : this.api.update(id, changes);

    return request.pipe(
      tap((alumno) =>
        this.alumnos.update((current) =>
          id === null
            ? [alumno, ...current]
            : current.map((item) => (item.id === id ? alumno : item)),
        ),
      ),
    );
  }

  remove(alumno: Alumno): Observable<void> {
    this.deletingId.set(alumno.id);
    return this.api.delete(alumno.id).pipe(
      tap(() => this.alumnos.update((current) => current.filter((item) => item.id !== alumno.id))),
      finalize(() => this.deletingId.set(null)),
    );
  }
}