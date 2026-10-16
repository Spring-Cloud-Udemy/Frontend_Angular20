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
    path: 'cursos',
    loadChildren: () => import('./features/cursos/cursos.routes').then((module) => module.CURSOS_ROUTES),
  },
  {
    path: 'examenes',
    loadChildren: () => import('./features/examenes/examenes.routes').then((module) => module.EXAMENES_ROUTES),
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
