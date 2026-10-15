import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { CommonService } from '../../shared/common.service';
import { Curso } from '../constant/cursos.component';
import { Alumno } from '../../alumno/constant/alumno.component';
import { Examen } from '../../examenes/constant/examenes.component';
import { API_BASE } from '../../core/config/api.config';

@Injectable({ providedIn: 'root' })
export class CursosService extends CommonService<Curso> {
  constructor(http: HttpClient) {
    super(http, `${API_BASE}/cursos`);
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