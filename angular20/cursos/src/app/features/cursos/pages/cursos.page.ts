import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { describeHttpError } from '../../../core/http/http-error.util';
import { Curso } from '../models/curso.model';
import { CursosService } from '../services/cursos.service';

@Component({
  selector: 'app-cursos-page',
  imports: [CommonModule],
  templateUrl: './cursos.html',
  styleUrl: './cursos.css',
})
export class CursosPage {
  private readonly cursosService = inject(CursosService);

  readonly cursos = signal<Curso[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly query = signal('');

  readonly filteredCursos = computed(() => {
    const term = this.query().trim().toLocaleLowerCase();
    if (!term) {
      return this.cursos();
    }

    return this.cursos().filter((curso) => curso.nombre.toLocaleLowerCase().includes(term));
  });

  constructor() {
    this.cargarCursos();
  }

  cargarCursos(): void {
    this.loading.set(true);// aplica el estado de carga podiendo mostrar un indicador de carga
    this.error.set(null); // limpia los errores previos antes de realizar la solicitud

    this.cursosService// se solicita la lista de cursos al backend  
      .listar()
      .pipe(finalize(() => this.loading.set(false))) //finaliza la consulta cuando la suscripcion con el backend termina  
      .subscribe({ //recibe la respuesta con suscribe y actualiza la señal de cursos o el error en caso de fallo

        //hay dos eventos posibles eventos guarda 
        next: (cursos) => this.cursos.set(cursos),  
        error: (error: unknown) => this.error.set(describeHttpError(error)),
      });
  }

  onSearchInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  studentCount(curso: Curso): number {
    return curso.alumnos?.length ?? curso.cursoAlumnos?.length ?? 0;
  }

  examCount(curso: Curso): number {
    return curso.examenes?.length ?? 0;
  }
}
