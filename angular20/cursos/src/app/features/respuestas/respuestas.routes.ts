import { Routes } from '@angular/router';

export const RESPUESTAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/respuestas.page').then((module) => module.RespuestasPage),
  },
];