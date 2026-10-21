export interface Respuesta {
  id?: string;
  texto: string;
  asignaturaId: number;
  alumnoId: number;
  preguntaId: number;
  examenId?: number | null;
}

export interface RespuestaInput {
  texto: string;
  asignaturaId: number;
  alumnoId: number;
  preguntaId: number;
  examenId?: number | null;
}

export interface RespuestaApi {
  id?: string;
  _id?: string;
  texto?: string;
  asignaturaId?: number | string | { id?: number | string };
  alumnoId?: number | string | { id?: number | string };
  preguntaId?: number | string | { id?: number | string };
  examenId?: number | string | { id?: number | string } | null;
  asignatura?: { id?: number | string };
  alumno?: { id?: number | string };
  pregunta?: { id?: number | string };
}
