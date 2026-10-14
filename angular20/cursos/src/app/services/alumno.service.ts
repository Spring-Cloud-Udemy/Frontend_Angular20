import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Alumno, AlumnoPayload } from '../models/alumno';

@Injectable({ providedIn: 'root' })
export class AlumnoService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = '/api/alumnos';

  list(): Observable<Alumno[]> {
    return this.http.get<Alumno[]>(this.endpoint);
  }

  create(alumno: AlumnoPayload): Observable<Alumno> {
    return this.http.post<Alumno>(this.endpoint, alumno);
  }

  update(id: number, alumno: AlumnoPayload): Observable<Alumno> {
    return this.http.put<Alumno>(`${this.endpoint}/${id}`, alumno);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
