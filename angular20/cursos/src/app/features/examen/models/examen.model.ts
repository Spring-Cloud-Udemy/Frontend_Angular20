export interface AsignaturaPadre {
  id: number;
  nombre: string;
  padre?: AsignaturaPadre | null;
}

export interface AsignaturaHija {
  id: number;
  nombre: string;
  hijos?: AsignaturaHija[];
}

export interface Asignatura {
  id: number;
  nombre: string;
  padre?: AsignaturaPadre | null;
  hijos?: AsignaturaHija[];
}

export interface Pregunta {
  id: number;
  texto: string;
  // Solo aparece si la pregunta se serializa por su cuenta (no dentro de examen.preguntas)
  examen?: Omit<Examen, 'preguntas'>;
}

export interface Examen {
  id: number;
  nombre: string;
  createAT: string;
  asignatura: Asignatura;
  preguntas: Pregunta[];
  respondido: boolean;
}

// Lo que se envía al crear o editar
export interface PreguntaInput {
  id?: number;   // presente si la pregunta ya existe (edición)
  texto: string;
}

export interface ExamenInput {
  nombre: string;
  asignatura: Pick<Asignatura, 'id'>;
  preguntas: PreguntaInput[];
}

export const EXAMEN_NOMBRE_MIN = 4;
export const EXAMEN_NOMBRE_MAX = 30;