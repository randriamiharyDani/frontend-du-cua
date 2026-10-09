
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  baseHref: '/',
  criticalCssPlans: [[1,"/styles-IWZDREWP.css",9592,["*","html","body","h1","h2","h3","h4","p","{margin:0}","a","{text-align:right;white-space:nowrap}","actions","card__header","{padding:1.5rem}","btn","btn--primary","btn--secondary","btn--ghost","btn--danger",".form-grid","form-grid","{grid-column:1/-1}","full","field","input","type","{grid-template-columns:1fr}","table","td","tbody","tr",".succes",".demo-note","succes","demo-note","filtres","toolbar",".filtres .field",".toolbar .field",".filtres .champ-recherche",".toolbar .champ-recherche","champ-recherche","empty-state",".modal__boite","modal__boite","du-modal-in","modal__fermer",".dl","dl","hr","{display:none}"],[["@media(max-width:700px){"],["@media(max-width:620px){"],["@media(prefers-reduced-motion:reduce){"],["@media(max-width:600px){"],["@media(max-width:1200px){"],["@media(max-width:900px){"]],[[10,"@charset \"UTF-8\";"],[5,":root","{--du-primary:#143a6b;--du-primary-dark:#0d294d;--du-primary-soft:#e9f0fa;--du-primary-soft-2:#f2f6fc;--du-accent:#c08a2e;--du-bg:#f4f6fa;--du-surface:#ffffff;--du-surface-2:#f8fafd;--du-border:#e5eaf2;--du-border-strong:#d3dcea;--du-text:#1e293b;--du-text-soft:#334155;--du-muted:#64748b;--du-success:#16794c;--du-success-soft:#e4f4ec;--du-danger:#c0392b;--du-danger-soft:#fbe9e7;--du-warning:#b7791f;--du-warning-soft:#fbf1de;--du-info:#1d4ed8;--du-info-soft:#e8eefb;--du-radius-sm:8px;--du-radius:10px;--du-radius-lg:14px;--du-shadow-xs:0 1px 2px rgba(15, 23, 42, .05);--du-shadow:0 1px 2px rgba(15, 23, 42, .04), 0 1px 3px rgba(15, 23, 42, .06);--du-shadow-md:0 4px 14px rgba(15, 23, 42, .09);--du-shadow-lg:0 18px 45px rgba(13, 41, 77, .22);--du-ring:0 0 0 3px rgba(20, 58, 107, .16);--du-ring-danger:0 0 0 3px rgba(192, 57, 43, .14);--du-transition:.17s ease}",[0]],[5,[1,"*:before","*:after"],"{box-sizing:border-box}",[0,0,0]],[5,2,"{-webkit-text-size-adjust:100%}",[0]],[5,[2,3],"{margin:0;min-height:100%}",[0,0]],[37,3,"{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica Neue,Arial,sans-serif;font-size:15px;line-height:1.55;color:var(--du-text);background:var(--du-bg);-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}",[0],["inter","system-ui","-apple-system","segoe ui","roboto","helvetica neue","arial","sans-serif"]],[5,[4,5,6,7],"{margin:0;color:var(--du-primary-dark);line-height:1.25;letter-spacing:-.015em;font-weight:700}",[3,3,3,3]],[5,4,"{font-size:1.6rem}",[3]],[5,5,"{font-size:1.05rem}",[3]],[5,6,"{font-size:.95rem}",[3]],[5,8,9,[3]],[5,10,"{color:var(--du-primary);text-decoration:none}",[3]],[5,1,"{scrollbar-width:thin;scrollbar-color:#c6d2e2 transparent}",[0]],[5,"*::-webkit-scrollbar","{width:10px;height:10px}",[0]],[5,"*::-webkit-scrollbar-thumb","{background:#c6d2e2;border-radius:999px;border:2px solid transparent;background-clip:content-box}",[0]],[5,"*::-webkit-scrollbar-thumb:hover","{background:#aebbcd;background-clip:content-box}",[0]],[5,".muted","{color:var(--du-muted)}",[1]],[5,".small","{font-size:.83rem}",[1]],[5,".nowrap","{white-space:nowrap}",[1]],[5,".centered","{text-align:center}",[1]],[37,".mono","{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,Liberation Mono,monospace;font-size:.84rem}",[1],["ui-monospace","sfmono-regular","menlo","consolas","liberation mono","monospace"]],[5,".actions",11,[1]],[5,".sr-only","{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}",[1]],[5,".card","{background:var(--du-surface);border:1px solid var(--du-border);border-radius:var(--du-radius-lg);box-shadow:var(--du-shadow);overflow:hidden}",[1]],[5,".card__header","{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem 1.5rem;border-bottom:1px solid var(--du-border);background:linear-gradient(180deg,#fff,var(--du-surface-2))}",[1]],[5,".card__header h2","{font-size:1rem}",[[" ",[13,[5,0,0,0]]]]],[5,".card__body",14,[1]],[5,".btn","{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.58rem 1rem;border-radius:var(--du-radius-sm);border:1px solid transparent;font:inherit;font-weight:600;font-size:.88rem;line-height:1.1;cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color var(--du-transition),border-color var(--du-transition),color var(--du-transition),box-shadow var(--du-transition),transform var(--du-transition)}",[1]],[5,".btn:active:not([disabled])","{transform:translateY(1px)}",[[[15],0,0,0]]],[5,".btn--primary","{background:linear-gradient(180deg,#1a4680,var(--du-primary));color:#fff;box-shadow:0 1px 2px #0d294d47}",[1]],[5,".btn--primary:hover","{background:linear-gradient(180deg,#17407a,var(--du-primary-dark));box-shadow:0 3px 10px #0d294d47}",[[[16],0,0,0]]],[5,".btn--secondary","{background:#fff;border-color:var(--du-border-strong);color:var(--du-primary);box-shadow:var(--du-shadow-xs)}",[1]],[5,".btn--secondary:hover","{background:var(--du-primary-soft);border-color:#bccbdf}",[[[17],0,0,0]]],[5,".btn--ghost","{background:transparent;color:var(--du-primary)}",[1]],[5,".btn--ghost:hover","{background:var(--du-primary-soft)}",[[[18],0,0,0]]],[5,".btn--danger","{background:linear-gradient(180deg,#cb4433,var(--du-danger));color:#fff;box-shadow:0 1px 2px #c0392b4d}",[1]],[5,".btn--danger:hover","{background:linear-gradient(180deg,#b93a2c,#a5311f)}",[[[19],0,0,0]]],[5,".btn--sm","{padding:.36rem .7rem;font-size:.79rem;border-radius:7px;gap:.35rem}",[1]],[5,".btn[disabled]","{opacity:.55;cursor:not-allowed;box-shadow:none;transform:none}",[["",[[0,[15],0,[["disabled",0,"",0]]]]]]],[5,20,"{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.1rem 1.25rem}",[1]],[5,".form-grid .full",22,[[" ",[21,23]]]],[5,".field","{display:flex;flex-direction:column;gap:.4rem}",[1]],[5,".field label","{font-weight:600;font-size:.82rem;color:var(--du-text-soft)}",[[" ",[24,["label",0,0,0]]]]],[5,".field .error","{color:var(--du-danger);font-size:.78rem;font-weight:500}",[[" ",[24,"error"]]]],[5,".input","{width:100%;padding:.6rem .8rem;border:1px solid var(--du-border-strong);border-radius:var(--du-radius-sm);font:inherit;color:inherit;background:#fff;transition:border-color var(--du-transition),box-shadow var(--du-transition)}",[1]],[5,".input:hover","{border-color:#c3d0e2}",[[[25],0,0,0]]],[5,".input:focus","{outline:none;border-color:var(--du-primary);box-shadow:var(--du-ring)}",[[[25],0,0,0]]],[5,".input::placeholder","{color:#9aa8bc}",[[[25],0,0,0]]],[5,".input.is-invalid","{border-color:var(--du-danger);box-shadow:var(--du-ring-danger)}",[["",[[0,[25,"is-invalid"],0,0]]]]],[5,"select.input","{cursor:pointer}",[["",[["select",[25],0,0]]]]],[5,"textarea.input","{min-height:110px;resize:vertical}",[["",[["textarea",[25],0,0]]]]],[5,"input[type=file].input","{padding:.45rem .6rem;cursor:pointer}",[["",[[25,[25],0,[[26,1,"file",0]]]]]]],[5,"input[type=checkbox]","{accent-color:var(--du-primary)}",[["",[[25,0,0,[[26,1,"checkbox",0]]]]]]],[21,20,27,[1],0],[5,".table-wrap","{overflow-x:auto}",[1]],[5,".table","{width:100%;border-collapse:collapse;font-size:.88rem}",[1]],[5,".table th","{text-align:left;font-size:.72rem;text-transform:uppercase;letter-spacing:.045em;font-weight:700;color:var(--du-muted);background:var(--du-surface-2);padding:.7rem 1rem;border-bottom:1px solid var(--du-border);white-space:nowrap}",[[" ",[28,["th",0,0,0]]]]],[5,".table td","{padding:.8rem 1rem;border-bottom:1px solid var(--du-border);vertical-align:middle}",[[" ",[28,[29,0,0,0]]]]],[5,".table tbody tr","{transition:background-color var(--du-transition)}",[["  ",[28,[30,0,0,0],[31,0,0,0]]]]],[5,".table tbody tr:hover","{background:var(--du-primary-soft-2)}",[["  ",[28,[30,0,0,0],[31,0,0,0]]]]],[5,".table tbody tr:last-child td","{border-bottom:0}",[["   ",[28,[30,0,0,0],[31,0,0,0],[29,0,0,0]]]]],[5,[".table td.actions",".table .actions"],11,[[" ",[28,[29,[12],0,0]]],[" ",[28,12]]]],[5,".table td.actions .btn+.btn","{margin-left:.4rem}",[["  +",[28,[29,[12],0,0],15,15]]]],[5,".badge","{display:inline-block;padding:.18rem .62rem;border-radius:999px;font-size:.74rem;font-weight:600;line-height:1.4;white-space:nowrap}",[1]],[5,".badge--neutral","{background:#eef1f6;color:#475569}",[1]],[5,".badge--info","{background:var(--du-info-soft);color:#1e40af}",[1]],[5,".badge--warning","{background:var(--du-warning-soft);color:#8a5a12}",[1]],[5,".badge--danger","{background:var(--du-danger-soft);color:#9a2f24}",[1]],[5,".badge--success","{background:var(--du-success-soft);color:#14603c}",[1]],[5,[".alerte",32,33],"{display:flex;align-items:center;gap:.55rem;margin:0 0 1.1rem;padding:.7rem .9rem;border-radius:var(--du-radius);font-size:.85rem;line-height:1.4;border:1px solid transparent}",[1,1,1]],[5,33,"{background:var(--du-warning-soft);border-color:#f0dcb4;color:#8a5a12}",[1]],[5,32,"{background:var(--du-success-soft);border-color:#bfe3d1;color:#14603c}",[1]],[5,[".filtres",".toolbar"],"{display:flex;flex-wrap:wrap;gap:.85rem;align-items:flex-end}",[1,1]],[5,[38,39],"{flex:1 1 190px;min-width:165px}",[[" ",[36,24]],[" ",[37,24]]]],[5,[40,41],"{flex:2 1 300px}",[[" ",[36,42]],[" ",[37,42]]]],[5,[".filtres>.btn",".toolbar>.btn"],"{flex:0 0 auto}",[[">",[36,15]],[">",[37,15]]]],[21,[38,39,40,41],"{flex-basis:100%}",[[" ",[36,24]],[" ",[37,24]],[" ",[36,42]],[" ",[37,42]]],1],[5,".pagination","{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.9rem 1.5rem;border-top:1px solid var(--du-border);flex-wrap:wrap}",[1]],[5,".pagination__nav","{display:flex;gap:.5rem}",[1]],[5,".empty-state","{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.35rem;padding:3rem 1.25rem;text-align:center;color:var(--du-muted)}",[1]],[5,[".empty-state du-icon",".empty-state>svg"],"{margin-bottom:.4rem;color:var(--du-primary);opacity:.55}",[[" ",[43,["du-icon",0,0,0]]],[">",[43,["svg",0,0,0]]]]],[5,".empty-state p",9,[[" ",[43,[8,0,0,0]]]]],[5,".modal","{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;padding:1rem}",[1]],[5,".modal__voile","{position:absolute;inset:0;background:#0d294d80;-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}",[1]],[69,44,"{position:relative;width:100%;max-width:660px;max-height:90vh;overflow:auto;background:var(--du-surface);border-radius:var(--du-radius-lg);box-shadow:var(--du-shadow-lg);animation:du-modal-in .18s ease-out}",[1],[46,".18s","ease-out"]],[258,"@keyframes du-modal-in{0%{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}",46],[5,".modal__entete","{position:sticky;top:0;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1.1rem 1.5rem;border-bottom:1px solid var(--du-border);background:linear-gradient(180deg,#fff,var(--du-surface-2))}",[1]],[5,".modal__fermer","{display:inline-grid;place-items:center;width:2.1rem;height:2.1rem;border:1px solid var(--du-border);border-radius:var(--du-radius-sm);background:#fff;color:var(--du-muted);cursor:pointer;transition:background-color var(--du-transition),color var(--du-transition)}",[1]],[5,".modal__fermer:hover","{background:var(--du-primary-soft);color:var(--du-primary)}",[[[47],0,0,0]]],[5,".modal__corps",14,[1]],[5,".modal__pied","{position:sticky;bottom:0;display:flex;justify-content:flex-end;gap:.75rem;padding:1rem 1.5rem;border-top:1px solid var(--du-border);background:#fff}",[1]],[85,44,"{animation:none}",[1],2,["none"]],[21,1,"{transition:none!important}",[0],2],[5,48,"{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem 1.75rem;margin:0}",[1]],[5,".dl dt","{font-size:.74rem;color:var(--du-muted);text-transform:uppercase;letter-spacing:.045em;font-weight:600}",[[" ",[49,["dt",0,0,0]]]]],[5,".dl dd","{margin:.2rem 0 0;font-weight:500;overflow-wrap:anywhere}",[[" ",[49,["dd",0,0,0]]]]],[5,".dl .full",22,[[" ",[49,23]]]],[21,48,27,[1],3],[5,".form-actions","{display:flex;justify-content:flex-end;gap:.75rem;flex-wrap:wrap;padding-top:.5rem}",[1]],[5,[50,".divider"],"{border:0;border-top:1px solid var(--du-border);margin:1rem 0}",[3,1]],[21,".hide-lg",51,[1],4],[21,".hide-md",51,[1],5],[21,".hide-sm",51,[1],3]]]],
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
    'index.csr.html': {size: 2336, hash: 'd7f03a5444cc204a', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 948, hash: '9385dbf8988718eb', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'connexion/index.html': {size: 13084, hash: 'a440dd1e0b40af1b', text: () => import('./assets-chunks/connexion_index_html.mjs').then(m => m.default)},
    'admin/dashboard/index.html': {size: 53630, hash: '376242a9aebf371e', text: () => import('./assets-chunks/admin_dashboard_index_html.mjs').then(m => m.default)},
    'admin/utilisateurs/index.html': {size: 46516, hash: '9794187fc1879b67', text: () => import('./assets-chunks/admin_utilisateurs_index_html.mjs').then(m => m.default)},
    'admin/localisations/index.html': {size: 45393, hash: '3c38ac76516f12a3', text: () => import('./assets-chunks/admin_localisations_index_html.mjs').then(m => m.default)},
    'admin/parametres/index.html': {size: 47360, hash: 'e15c6300f7393174', text: () => import('./assets-chunks/admin_parametres_index_html.mjs').then(m => m.default)},
    'admin/canevas-excel/index.html': {size: 59126, hash: '1a6dc9e7156fdaba', text: () => import('./assets-chunks/admin_canevas-excel_index_html.mjs').then(m => m.default)},
    'admin/mouvements/index.html': {size: 43924, hash: '4f35a88e366d3279', text: () => import('./assets-chunks/admin_mouvements_index_html.mjs').then(m => m.default)},
    'admin/documents/index.html': {size: 49071, hash: 'ab56f3ac812c1a88', text: () => import('./assets-chunks/admin_documents_index_html.mjs').then(m => m.default)},
    'admin/dossiers/index.html': {size: 50524, hash: 'd2f3288041938dc0', text: () => import('./assets-chunks/admin_dossiers_index_html.mjs').then(m => m.default)}
  },
};
