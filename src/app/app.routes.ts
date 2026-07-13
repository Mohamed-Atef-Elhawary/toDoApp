import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/components/page-title-component/page-title-component').then(
        (c) => c.PageTitleComponent,
      ),
  },
];
