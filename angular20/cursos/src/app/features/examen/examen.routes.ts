import { Routes } from '@angular/router';

export const EXAMENES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/examenes.page').then((module) => module.ExamenesPage),
  },
];