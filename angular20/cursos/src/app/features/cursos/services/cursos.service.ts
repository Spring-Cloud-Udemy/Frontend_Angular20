import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { CommonService } from '../../../shared/common.service';
import { Curso } from '../models/curso.model';
import { Alumno } from '../../alumno/models/alumno.model';
import { Examen } from '../../examenes/models/examen.model';
import { API_ENDPOINTS } from '../../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class CursosService extends CommonService<Curso> {
  // eslint-disable-next-line @angular-eslint/prefer-inject
  constructor(http: HttpClient) {
    super(http, API_ENDPOINTS.cursos);
  }

  asignarAlumnos(cursoId: number, alumnos: Alumno[]): Observable<Curso> {
    return this.http.put<Curso>(`${this.baseEndpoint}/${cursoId}/asignar-alumnos`, alumnos);
  }

  eliminarAlumno(cursoId: number, alumno: Alumno): Observable<Curso> {
    return this.http.put<Curso>(`${this.baseEndpoint}/${cursoId}/eliminar-alumno`, alumno);
  }

  obtenerPorAlumno(alumnoId: number): Observable<Curso | null> {
    return this.http.get<Curso | null>(`${this.baseEndpoint}/alumno/${alumnoId}`);
  }

  asignarExamenes(cursoId: number, examenes: Examen[]): Observable<Curso> {
    return this.http.put<Curso>(`${this.baseEndpoint}/${cursoId}/asignar-examenes`, examenes);
  }

  eliminarExamen(cursoId: number, examen: Examen): Observable<Curso> {
    return this.http.put<Curso>(`${this.baseEndpoint}/${cursoId}/eliminar-examen`, examen);
  }

  eliminarCursoAlumnoPorId(cursoAlumnoId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseEndpoint}/eliminar-Alumno/${cursoAlumnoId}`);
  }
}