import { Routes } from '@angular/router';

export const CURSOS_ROUTES: Routes = [
  // Ruta principal para la lista de cursos
  { path: '', loadComponent: () => import('./pages/cursos.page').then(m => m.CursosPage) },

  // Ruta para el detalle de un curso específico
  { path: ':id', loadComponent: () => import('../cursos-detalle/pages/curso-detalle.page').then(m => m.CursoDetallePage) },
];