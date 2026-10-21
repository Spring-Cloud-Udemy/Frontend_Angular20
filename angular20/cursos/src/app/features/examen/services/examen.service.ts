import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE, API_ENDPOINTS } from '../../../core/config/api.config';
import { CommonService } from '../../../shared/common.service';
import { AsignaturaCurso } from '../../asignaturas/models/asignatura-curso.model';
import { Examen, ExamenInput } from '../models/examen.model';

@Injectable({ providedIn: 'root' })
export class ExamenService extends CommonService<Examen> {

  constructor() {
    super(inject(HttpClient), API_ENDPOINTS.examenes);
  }

 
  crearExamen(input: ExamenInput): Observable<Examen> {
    return this.http.post<Examen>(this.baseEndpoint, input);
  }

  editarExamen(id: number, input: ExamenInput): Observable<Examen> {
    return this.http.put<Examen>(`${this.baseEndpoint}/${id}`, input);
  }

  listarAsignaturas(): Observable<AsignaturaCurso[]> {
    return this.http.get<AsignaturaCurso[]>(`${this.baseEndpoint}/asignaturas`);
  }

  obtenerPorPregunta(preguntaId: number): Observable<Examen> {
    return this.http.get<Examen>(`${this.baseEndpoint}/por-pregunta/${preguntaId}`);
  }

  obtenerAsignaturasEstudiante(estudianteId: number): Observable<AsignaturaCurso[]> {
    return this.http.get<AsignaturaCurso[]>(`${API_BASE}/estudiantes/${estudianteId}/asignaturas`);
  }

  obtenerExamenesEstudiante(estudianteId: number, asignaturaId?: number): Observable<Examen[]> {
    return this.http.get<Examen[]>(`${API_BASE}/estudiantes/${estudianteId}/examenes`, {
      params: asignaturaId === undefined ? {} : { asignaturaId },
    });
  }
}