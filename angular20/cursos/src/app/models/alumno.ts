export interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  createAT?: string | null;
}

export type AlumnoPayload = Pick<Alumno, 'nombre' | 'apellido' | 'email'>;
