import { Alumno } from '../../alumno/models/alumno.model';
import { Examen } from '../../examenes/models/examen.model';

export interface CursoAlumno {
  id?: number;
  alumnoId: number;
}

export interface Curso {
  id?: number;
  nombre: string;
  createAT?: string;
  cursoAlumnos?: CursoAlumno[];
  alumnos?: Alumno[];
  examenes?: Examen[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
