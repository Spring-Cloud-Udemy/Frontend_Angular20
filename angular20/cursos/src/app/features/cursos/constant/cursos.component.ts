import { HttpErrorResponse } from '@angular/common/http';
import { Alumno } from '../../alumno/constant/alumno.component';
import { Examen } from '../../examenes/constant/examenes.component';

export interface CursoAlumno {
  id?: number;
  alumnoId: number;
}

export interface Curso {
  id?: number;
  nombre: string;
  createAT?: string;            // así lo serializa Jackson (getCreateAT)
  cursoAlumnos?: CursoAlumno[]; // ids de alumnos guardados en el curso
  alumnos?: Alumno[];           // @Transient, lo rellena el controller
  examenes?: Examen[];
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
erroresForm: { [campo: string]: string } = {};

guardar(): void {
  const peticion = this.curso.id
    ? this.service.editar(this.curso.id, this.curso)
    : this.service.crear(this.curso);

  peticion.subscribe({
    next: () => {
      this.curso = { nombre: '' };
      this.erroresForm = {};
      this.cargarPagina();
    },
    error: (e: HttpErrorResponse) => {
      if (e.status === 400) {
        this.erroresForm = e.error;   // ej. { nombre: "no debe estar vacío" }
      } else {
        this.error = 'No se pudo guardar el curso';
      }
    }
  });
}

verDetalle(id: number): void {
  this.service.ver(id).subscribe(c => (this.curso = c)); // aquí sí vienen alumnos completos
}

asignarAlumnos(alumnos: Alumno[]): void {
  if (!this.curso.id) return;
  this.service.asignarAlumnos(this.curso.id, alumnos).subscribe(() => this.verDetalle(this.curso.id!));
}

quitarAlumno(alumno: Alumno): void {
  if (!this.curso.id) return;
  this.service.eliminarAlumno(this.curso.id, alumno).subscribe(() => this.verDetalle(this.curso.id!));
}

asignarExamenes(examenes: Examen[]): void {
  if (!this.curso.id) return;
  this.service.asignarExamenes(this.curso.id, examenes).subscribe(() => this.verDetalle(this.curso.id!));
}