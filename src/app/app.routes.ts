import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'inject-async',
    pathMatch: 'full'
  },
  {
    path: 'inject-async',
    loadComponent: () => import('./pages/inject-async/inject-async').then(m => m.InjectAsyncComponent)
  },
  {
    path: 'http-resource',
    loadComponent: () => import('./pages/http-resource/http-resource').then(m => m.HttpResourceComponent)
  },
  {
    path: 'signal-forms',
    loadComponent: () => import('./pages/signal-forms/signal-forms').then(m => m.SignalFormsComponent)
  },
  {
    path: 'templates',
    loadComponent: () => import('./pages/templates/templates').then(m => m.TemplatesComponent)
  },
  {
    path: '**',
    redirectTo: 'inject-async'
  }
];
