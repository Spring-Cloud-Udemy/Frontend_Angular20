import { Routes } from '@angular/router';

export const ASIGNATURAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/asignaturas.page').then((module) => module.AsignaturasPage),
  },
];
