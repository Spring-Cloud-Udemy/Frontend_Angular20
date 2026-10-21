export interface AsignaturaCurso {
  id: number;
  nombre: string;
  hijos: AsignaturaCurso[];
}
