
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/connexion",
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/connexion"
  },
  {
    "renderMode": 1,
    "redirectTo": "/admin/dashboard",
    "route": "/admin"
  },
  {
    "renderMode": 1,
    "route": "/admin/dashboard"
  },
  {
    "renderMode": 1,
    "route": "/admin/dossiers"
  },
  {
    "renderMode": 1,
    "route": "/admin/dossiers/nouveau"
  },
  {
    "renderMode": 1,
    "route": "/admin/dossiers/*"
  },
  {
    "renderMode": 1,
    "route": "/admin/dossiers/*/modifier"
  },
  {
    "renderMode": 1,
    "route": "/admin/mouvements"
  },
  {
    "renderMode": 1,
    "route": "/admin/localisations"
  },
  {
    "renderMode": 1,
    "route": "/admin/documents"
  },
  {
    "renderMode": 1,
    "route": "/admin/utilisateurs"
  },
  {
    "renderMode": 1,
    "route": "/admin/canevas-excel"
  },
  {
    "renderMode": 1,
    "route": "/admin/parametres"
  },
  {
    "renderMode": 2,
    "redirectTo": "/connexion",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 390, hash: '9991fc4d762122a8', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 930, hash: 'f8bb8d62d8e385ed', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'connexion/index.html': {size: 10195, hash: '08ae4904c27704ba', text: () => import('./assets-chunks/connexion_index_html.mjs').then(m => m.default)}
  },
};
