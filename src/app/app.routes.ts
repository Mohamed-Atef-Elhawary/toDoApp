import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/tasks/all', pathMatch: 'full' },
  {
    path: 'tasks/:category',
    loadComponent: () =>
      import('./features/tasks-component/tasks-component').then((c) => c.TasksComponent),
  },
  {
    path: '**',
    redirectTo: '/tasks/all',
    pathMatch: 'full',
  },
];
