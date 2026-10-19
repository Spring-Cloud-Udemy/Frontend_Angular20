import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { Examen } from '../models/examen.model';
import { ExamenService } from './examen.service';

@Injectable({ providedIn: 'root' })
export class ExamenStore {
  private readonly api = inject(ExamenService);

  readonly examenes = signal<Examen[]>([]);
  readonly loading = signal(false);

  load(): Observable<Examen[]> {
    this.loading.set(true);
    return this.api.listar().pipe(
      tap((examenes) => this.examenes.set(examenes)),
      finalize(() => this.loading.set(false)),
    );
  }
}