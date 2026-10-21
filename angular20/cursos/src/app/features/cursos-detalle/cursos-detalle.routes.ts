import { Routes } from '@angular/router';

export const CURSOS_ROUTES: Routes = [
 
  // Ruta para el detalle de un curso específico
  { path: ':id', loadComponent: () => import('../cursos-detalle/pages/curso-detalle.page').then(m => m.CursoDetallePage) },
];