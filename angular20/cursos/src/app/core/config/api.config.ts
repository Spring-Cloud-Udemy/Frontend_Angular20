import { environment } from '../../../environments/environment';

export const API_BASE = environment.apiUrl.replace(/\/+$/, '');

export const API_ENDPOINTS = {
  alumnos: `${API_BASE}/alumnos`,
  estudiantes: `${API_BASE}/estudiantes`,
  cursos: `${API_BASE}/cursos`,
  examenes: `${API_BASE}/examenes`,
  respuestas: `${API_BASE}/respuestas`,
} as const;