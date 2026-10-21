export interface AsignaturaPadre {
  id: number;
  nombre: string;
}

export interface Asignatura {
  id: number;
  nombre: string;
  padre?: AsignaturaPadre | null;
  hijos?: Asignatura[];
}

export interface AsignaturaInput {
  nombre: string;
  padreId?: number | null;
}
