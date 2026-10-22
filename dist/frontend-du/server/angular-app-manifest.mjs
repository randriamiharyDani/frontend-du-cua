
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
    'index.csr.html': {size: 441, hash: 'e26ceff38ad522be', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 981, hash: '5a680b018ec93141', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'connexion/index.html': {size: 18741, hash: '613f8bef819b70b1', text: () => import('./assets-chunks/connexion_index_html.mjs').then(m => m.default)}
  },
};
