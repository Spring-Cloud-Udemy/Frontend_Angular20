import { Routes } from '@angular/router';

export const CURSOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/cursos.page').then((module) => module.CursosPage),
  },
];