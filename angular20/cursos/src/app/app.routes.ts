import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'alumnos',
  },
  {
    path: 'alumnos',
    loadChildren: () => import('./features/alumno/alumno.routes').then((module) => module.ALUMNO_ROUTES),
  },
  {
    path: 'estudiantes/:id/asignaturas',
    loadComponent: () =>
      import('./features/alumno/pages/estudiante-asignaturas.page').then(
        (module) => module.EstudianteAsignaturasPage,
      ),
  },
  {
    path: 'cursos',
    loadChildren: () => import('./features/cursos/cursos.routes').then((module) => module.CURSOS_ROUTES),
  },
  {
    path: 'examenes',
    loadChildren: () => import('./features/examen/examen.routes').then((module) => module.EXAMENES_ROUTES),
  },
  {
    path: 'asignaturas',
    loadChildren: () =>
      import('./features/asignaturas/asignaturas.routes').then((m) => m.ASIGNATURAS_ROUTES),
  },
  {
    path: 'respuestas',
    loadChildren: () => import('./features/respuestas/respuestas.routes').then((module) => module.RESPUESTAS_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'alumnos',
  },
];
