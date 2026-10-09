
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  baseHref: '/',
  criticalCssPlans: [[1,"/styles-TDQO7G4P.css",4400,["body","h1","h2","h3","a","btn","btn--primary","btn--secondary",".form-grid","form-grid","{grid-column:1/-1}","full","field","input","{grid-template-columns:1fr}","table","td","{display:none}",".dl","dl",".toolbar","toolbar"],[["@media(max-width:700px){"],["@media(max-width:900px){"],["@media(max-width:600px){"],["@media(max-width:1000px){"]],[[5,":root","{--du-primary:#12305a;--du-primary-dark:#0c2243;--du-primary-soft:#e9eff8;--du-accent:#b7791f;--du-bg:#f3f5f9;--du-surface:#ffffff;--du-border:#dde3ed;--du-text:#1b2a3b;--du-muted:#647387;--du-success:#2e7d5b;--du-danger:#b3423a;--du-radius:8px;--du-shadow:0 1px 2px rgba(16, 24, 40, .06), 0 1px 3px rgba(16, 24, 40, .04)}",[0]],[5,["*","*:before","*:after"],"{box-sizing:border-box}",[0,0,0]],[5,["html",1],"{margin:0;min-height:100%}",[0,0]],[37,1,"{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;font-size:15px;line-height:1.5;color:var(--du-text);background:var(--du-bg);-webkit-font-smoothing:antialiased}",[0],["system-ui","-apple-system","segoe ui","roboto","helvetica neue","arial","sans-serif"]],[5,[2,3,4],"{margin:0;color:var(--du-primary-dark);line-height:1.25}",[3,3,3]],[5,2,"{font-size:1.5rem}",[3]],[5,3,"{font-size:1.05rem}",[3]],[5,5,"{color:var(--du-primary)}",[3]],[5,".muted","{color:var(--du-muted)}",[1]],[5,".small","{font-size:.85rem}",[1]],[5,".card","{background:var(--du-surface);border:1px solid var(--du-border);border-radius:var(--du-radius);box-shadow:var(--du-shadow)}",[1]],[5,".card__header","{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 1.25rem;border-bottom:1px solid var(--du-border)}",[1]],[5,".card__body","{padding:1.25rem}",[1]],[5,".btn","{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.55rem 1rem;border-radius:var(--du-radius);border:1px solid transparent;font:inherit;font-weight:600;font-size:.9rem;cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color .15s,border-color .15s}",[1]],[5,".btn--primary","{background:var(--du-primary);color:#fff}",[1]],[5,".btn--primary:hover","{background:var(--du-primary-dark)}",[[[7],0,0,0]]],[5,".btn--secondary","{background:#fff;border-color:var(--du-border);color:var(--du-primary)}",[1]],[5,".btn--secondary:hover","{background:var(--du-primary-soft)}",[[[8],0,0,0]]],[5,".btn--sm","{padding:.35rem .7rem;font-size:.82rem}",[1]],[5,".btn[disabled]","{opacity:.5;cursor:not-allowed}",[["",[[0,[6],0,[["disabled",0,"",0]]]]]]],[5,9,"{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem 1.25rem}",[1]],[5,".form-grid .full",11,[[" ",[10,12]]]],[5,".field","{display:flex;flex-direction:column;gap:.35rem}",[1]],[5,".field label","{font-weight:600;font-size:.85rem}",[[" ",[13,["label",0,0,0]]]]],[5,".field .error","{color:var(--du-danger);font-size:.8rem}",[[" ",[13,"error"]]]],[5,".input","{width:100%;padding:.55rem .75rem;border:1px solid var(--du-border);border-radius:var(--du-radius);font:inherit;color:inherit;background:#fff}",[1]],[5,".input:focus","{border-color:var(--du-primary);outline:3px solid var(--du-primary-soft)}",[[[14],0,0,0]]],[5,".input.is-invalid","{border-color:var(--du-danger)}",[["",[[0,[14,"is-invalid"],0,0]]]]],[5,"textarea.input","{min-height:120px;resize:vertical}",[["",[["textarea",[14],0,0]]]]],[21,9,15,[1],0],[5,".table-wrap","{overflow-x:auto}",[1]],[5,".table","{width:100%;border-collapse:collapse;font-size:.9rem}",[1]],[5,".table th","{text-align:left;font-size:.74rem;text-transform:uppercase;letter-spacing:.04em;color:var(--du-muted);background:#f7f9fc;padding:.7rem 1rem;border-bottom:1px solid var(--du-border);white-space:nowrap}",[[" ",[16,["th",0,0,0]]]]],[5,".table td","{padding:.8rem 1rem;border-bottom:1px solid var(--du-border);vertical-align:middle}",[[" ",[16,[17,0,0,0]]]]],[5,".table tbody tr:hover","{background:#f9fbfd}",[["  ",[16,["tbody",0,0,0],["tr",0,0,0]]]]],[5,".table td.actions","{text-align:right;white-space:nowrap}",[[" ",[16,[17,["actions"],0,0]]]]],[21,".hide-md",18,[1],1],[21,".hide-sm",18,[1],2],[5,".badge","{display:inline-block;padding:.15rem .6rem;border-radius:999px;font-size:.76rem;font-weight:600;white-space:nowrap}",[1]],[5,".badge--neutral","{background:#eef1f5;color:#475569}",[1]],[5,".badge--info","{background:#e6eef9;color:#1f4f8f}",[1]],[5,".badge--warning","{background:#fbf1de;color:#8a5a12}",[1]],[5,".badge--danger","{background:#f9e6e4;color:#8f2f29}",[1]],[5,".badge--success","{background:#e2f2ea;color:#1f6046}",[1]],[5,19,"{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem 1.5rem;margin:0}",[1]],[5,".dl dt","{font-size:.76rem;color:var(--du-muted);text-transform:uppercase;letter-spacing:.04em}",[[" ",[20,["dt",0,0,0]]]]],[5,".dl dd","{margin:.15rem 0 0;font-weight:500;overflow-wrap:anywhere}",[[" ",[20,["dd",0,0,0]]]]],[5,".dl .full",11,[[" ",[20,12]]]],[21,19,15,[1],2],[5,".empty-state","{padding:2.5rem 1rem;text-align:center;color:var(--du-muted)}",[1]],[5,21,"{display:grid;grid-template-columns:2fr repeat(3,1fr) auto;gap:.75rem;align-items:end}",[1]],[21,21,"{grid-template-columns:repeat(2,1fr)}",[1],3],[21,21,15,[1],2],[5,".pagination","{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.85rem 1.25rem;flex-wrap:wrap}",[1]],[5,".form-actions","{display:flex;justify-content:flex-end;gap:.75rem;flex-wrap:wrap;padding-top:.5rem}",[1]],[5,".sr-only","{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}",[1]]]]],
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
    'index.csr.html': {size: 1344, hash: '9306d2b00b4f17d7', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 948, hash: '9edcac8282f0a998', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'connexion/index.html': {size: 11321, hash: '60dbd0595ffdb58d', text: () => import('./assets-chunks/connexion_index_html.mjs').then(m => m.default)},
    'admin/dossiers/index.html': {size: 34854, hash: 'ce6d732dd179fb37', text: () => import('./assets-chunks/admin_dossiers_index_html.mjs').then(m => m.default)},
    'admin/parametres/index.html': {size: 22414, hash: '3885e766b48d843c', text: () => import('./assets-chunks/admin_parametres_index_html.mjs').then(m => m.default)},
    'admin/dashboard/index.html': {size: 43900, hash: '75964a587c4db6b3', text: () => import('./assets-chunks/admin_dashboard_index_html.mjs').then(m => m.default)},
    'admin/utilisateurs/index.html': {size: 22384, hash: '149750062548e704', text: () => import('./assets-chunks/admin_utilisateurs_index_html.mjs').then(m => m.default)},
    'admin/localisations/index.html': {size: 22425, hash: 'ace2d1ecabd7a824', text: () => import('./assets-chunks/admin_localisations_index_html.mjs').then(m => m.default)},
    'admin/documents/index.html': {size: 22406, hash: '202dd538fd30c8c4', text: () => import('./assets-chunks/admin_documents_index_html.mjs').then(m => m.default)},
    'admin/canevas-excel/index.html': {size: 22419, hash: '8a5b7c7f0792ac03', text: () => import('./assets-chunks/admin_canevas-excel_index_html.mjs').then(m => m.default)},
    'admin/mouvements/index.html': {size: 22415, hash: '9b35b4d542be0e17', text: () => import('./assets-chunks/admin_mouvements_index_html.mjs').then(m => m.default)}
  },
};
