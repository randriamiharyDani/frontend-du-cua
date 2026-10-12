
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
    "renderMode": 2,
    "redirectTo": "/admin/dashboard",
    "route": "/admin"
  },
  {
    "renderMode": 2,
    "route": "/admin/dashboard"
  },
  {
    "renderMode": 2,
    "route": "/admin/dossiers"
  },
  {
    "renderMode": 0,
    "route": "/admin/dossiers/nouveau"
  },
  {
    "renderMode": 0,
    "route": "/admin/dossiers/*"
  },
  {
    "renderMode": 0,
    "route": "/admin/dossiers/*/modifier"
  },
  {
    "renderMode": 2,
    "route": "/admin/mouvements"
  },
  {
    "renderMode": 2,
    "route": "/admin/localisations"
  },
  {
    "renderMode": 2,
    "route": "/admin/documents"
  },
  {
    "renderMode": 2,
    "route": "/admin/utilisateurs"
  },
  {
    "renderMode": 2,
    "route": "/admin/canevas-excel"
  },
  {
    "renderMode": 2,
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
    'connexion/index.html': {size: 10195, hash: '08ae4904c27704ba', text: () => import('./assets-chunks/connexion_index_html.mjs').then(m => m.default)},
    'admin/utilisateurs/index.html': {size: 44028, hash: '9971bc6e88eb5d83', text: () => import('./assets-chunks/admin_utilisateurs_index_html.mjs').then(m => m.default)},
    'admin/parametres/index.html': {size: 45311, hash: '5528b0d2781af0e1', text: () => import('./assets-chunks/admin_parametres_index_html.mjs').then(m => m.default)},
    'admin/localisations/index.html': {size: 43035, hash: '4c07a2c7ef72ce10', text: () => import('./assets-chunks/admin_localisations_index_html.mjs').then(m => m.default)},
    'admin/canevas-excel/index.html': {size: 57017, hash: '222c7a60eccb0df1', text: () => import('./assets-chunks/admin_canevas-excel_index_html.mjs').then(m => m.default)},
    'admin/documents/index.html': {size: 46978, hash: 'd622fc080d28eae6', text: () => import('./assets-chunks/admin_documents_index_html.mjs').then(m => m.default)},
    'admin/mouvements/index.html': {size: 41657, hash: '5a0a00656a043bc1', text: () => import('./assets-chunks/admin_mouvements_index_html.mjs').then(m => m.default)},
    'admin/dossiers/index.html': {size: 48157, hash: '253dbcf75e0337b2', text: () => import('./assets-chunks/admin_dossiers_index_html.mjs').then(m => m.default)},
    'admin/dashboard/index.html': {size: 51724, hash: '36c610b008e6460d', text: () => import('./assets-chunks/admin_dashboard_index_html.mjs').then(m => m.default)}
  },
};
