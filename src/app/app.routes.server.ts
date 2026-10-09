import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'connexion',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'admin/dossiers/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'admin/dossiers/:id/modifier',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];


