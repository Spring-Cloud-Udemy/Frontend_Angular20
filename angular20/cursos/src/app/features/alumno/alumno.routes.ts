import { Routes } from '@angular/router';

export const ALUMNO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/alumno.page').then(m => m.AlumnoPage),
  },
];
