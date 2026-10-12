import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'connexion',
    renderMode: RenderMode.Prerender,
  },
  {
    // L'espace admin dépend du jeton stocké côté navigateur : rendu client.
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];


