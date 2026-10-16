import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AlumnoInput } from '../models/alumno-input.model';
import { Alumno } from '../models/alumno.model';
import { API_ENDPOINTS } from '../../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class AlumnoService {
  private readonly http = inject(HttpClient);
  private readonly endpoint = API_ENDPOINTS.alumnos;

  list(): Observable<Alumno[]> {
    return this.http.get<Alumno[]>(this.endpoint);
  }

  create(alumno: AlumnoInput): Observable<Alumno> {
    return this.http.post<Alumno>(this.endpoint, alumno);
  }

  update(id: number, alumno: AlumnoInput): Observable<Alumno> {
    return this.http.put<Alumno>(`${this.endpoint}/${id}`, alumno);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/${id}`);
  }
}
