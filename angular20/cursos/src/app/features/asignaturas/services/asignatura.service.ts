import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../core/config/api.config';
import { Asignatura, AsignaturaInput } from '../models/asignatura.model';

@Injectable({ providedIn: 'root' })
export class AsignaturaService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = API_ENDPOINTS.asignaturas;

  listar(): Observable<Asignatura[]> {
    return this.http.get<Asignatura[]>(this.endpoint);
  }

  ver(id: number): Observable<Asignatura> {
    return this.http.get<Asignatura>(`${this.endpoint}/${id}`);
  }

  crear(asignatura: AsignaturaInput): Observable<Asignatura> {
    return this.http.post<Asignatura>(this.endpoint, this.toPayload(asignatura));
  }

  editar(id: number, asignatura: AsignaturaInput): Observable<Asignatura> {
    return this.http.put<Asignatura>(`${this.endpoint}/${id}`, this.toPayload(asignatura));
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }

  private toPayload(asignatura: AsignaturaInput): { nombre: string; padre: { id: number } | null } {
    return {
      nombre: asignatura.nombre,
      padre: asignatura.padreId ? { id: asignatura.padreId } : null,
    };
  }
}
