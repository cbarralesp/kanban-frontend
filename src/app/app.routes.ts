import { Routes } from '@angular/router';

/** Cada pantalla se carga "perezosamente" (lazy loading): solo se descarga cuando se visita. */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'tablero' },
  {
    path: 'tablero',
    title: 'Tablero Kanban',
    loadComponent: () => import('./features/tareas/pages/tablero.page').then((m) => m.TableroPage),
  },
  { path: '**', redirectTo: 'tablero' },
];
