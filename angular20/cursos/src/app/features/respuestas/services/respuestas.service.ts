import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/config/api.config';
import { Respuesta, RespuestaApi, RespuestaInput } from '../models/respuesta.model';

@Injectable({ providedIn: 'root' })
export class RespuestasService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = API_ENDPOINTS.respuestas;

  readonly count = signal<number | null>(null);

  listar(): Observable<Respuesta[]> {
    return this.http.get<RespuestaApi[] | RespuestaApi>(this.endpoint).pipe(
      map((payload) => this.normalizeList(payload)),
      tap((respuestas) => this.count.set(respuestas.length)),
    );
  }

  listarPorAsignatura(asignaturaId: number): Observable<Respuesta[]> {
    return this.http
      .get<RespuestaApi[] | RespuestaApi>(`${this.endpoint}/asignatura/${asignaturaId}`)
      .pipe(map((payload) => this.normalizeList(payload)));
  }

  listarPorAsignaturaYAlumno(asignaturaId: number, alumnoId: number): Observable<Respuesta[]> {
    return this.http
      .get<RespuestaApi[] | RespuestaApi>(
        `${this.endpoint}/asignatura/${asignaturaId}/alumno/${alumnoId}`,
      )
      .pipe(map((payload) => this.normalizeList(payload)));
  }

  ver(id: string): Observable<Respuesta> {
    return this.http.get<RespuestaApi>(`${this.endpoint}/${id}`).pipe(map((item) => this.normalize(item)));
  }

  crear(respuesta: RespuestaInput): Observable<Respuesta> {
    return this.http.post<RespuestaApi[] | RespuestaApi>(this.endpoint, [respuesta]).pipe(
      map((payload) => {
        const created = this.normalizeList(payload)[0];
        if (!created) {
          throw new Error('El backend no devolvió la respuesta creada.');
        }
        return created;
      }),
      tap(() => this.count.update((current) => (current ?? 0) + 1)),
    );
  }

  editar(id: string, respuesta: RespuestaInput): Observable<Respuesta> {
    return this.http
      .put<RespuestaApi>(`${this.endpoint}/${id}`, respuesta)
      .pipe(map((item) => this.normalize(item)));
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`).pipe(
      tap(() => this.count.update((current) => Math.max(0, (current ?? 1) - 1))),
    );
  }

  private normalizeList(payload: RespuestaApi[] | RespuestaApi | null | undefined): Respuesta[] {
    if (!payload) {
      return [];
    }
    return (Array.isArray(payload) ? payload : [payload]).map((item) => this.normalize(item));
  }

  private normalize(item: RespuestaApi | null | undefined): Respuesta {
    const source = item ?? {};
    return {
      id: source.id ?? source._id,
      texto: source.texto?.trim() ?? '',
      asignaturaId: this.asId(source.asignaturaId ?? source.asignatura),
      alumnoId: this.asId(source.alumnoId ?? source.alumno),
      preguntaId: this.asId(source.preguntaId ?? source.pregunta),
      examenId: this.asId(source.examenId) || null,
    };
  }

  private asId(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    if (value && typeof value === 'object' && 'id' in value) {
      return this.asId((value as { id?: unknown }).id);
    }
    return 0;
  }
}
