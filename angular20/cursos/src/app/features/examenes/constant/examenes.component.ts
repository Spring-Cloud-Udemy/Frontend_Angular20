export interface Examen {
  id?: number;
  nombre: string;
  respondido?: boolean; // lo marca buscarPorAlumnoId
}