export default `<!DOCTYPE html><html lang="en"><head>
  <meta charset="utf-8">
  <title>Connexion — Espace d’administration DU</title>
  <base href="/">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" type="image/x-icon" href="favicon.ico">
<link rel="stylesheet" href="styles.css"><style ng-app-id="ng">
[_nghost-ng-c3984273398] {
  display: block;
  min-height: 100dvh;
}
/*# sourceMappingURL=/app.css.map */</style><style ng-app-id="ng">@charset "UTF-8";


.login-page[_ngcontent-ng-c2020179949] {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(rgba(15, 23, 42, 0.55), rgba(15, 23, 42, 0.55)), url(/images/tana-renivohitra.jpeg) center/cover no-repeat;
}
.login-page[_ngcontent-ng-c2020179949]::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  mix-blend-mode: screen;
  background:
    radial-gradient(
      circle at 15% 25%,
      color-mix(in srgb, var(--du-primary) 70%, transparent),
      transparent 45%),
    radial-gradient(
      circle at 85% 20%,
      rgba(0, 200, 255, 0.45),
      transparent 40%),
    radial-gradient(
      circle at 70% 85%,
      rgba(255, 60, 160, 0.4),
      transparent 45%),
    radial-gradient(
      circle at 20% 90%,
      rgba(120, 80, 255, 0.45),
      transparent 45%);
  background-size: 220% 220%;
  animation: _ngcontent-ng-c2020179949_login-aurore 9s ease-in-out infinite alternate;
}
.login-page[_ngcontent-ng-c2020179949]::after {
  content: "";
  position: absolute;
  inset: -25%;
  z-index: 0;
  pointer-events: none;
  background:
    radial-gradient(
      circle 120px at 20% 30%,
      rgba(255, 255, 255, 0.22),
      transparent 70%),
    radial-gradient(
      circle 180px at 75% 25%,
      rgba(0, 220, 255, 0.25),
      transparent 70%),
    radial-gradient(
      circle 150px at 65% 75%,
      rgba(255, 90, 180, 0.22),
      transparent 70%),
    radial-gradient(
      circle 100px at 25% 78%,
      rgba(255, 220, 90, 0.2),
      transparent 70%),
    radial-gradient(
      circle 220px at 50% 50%,
      rgba(120, 90, 255, 0.18),
      transparent 70%);
  filter: blur(6px);
  animation: _ngcontent-ng-c2020179949_login-orbes-rotation 28s linear infinite, _ngcontent-ng-c2020179949_login-orbes-pulse 5s ease-in-out infinite alternate;
}
@keyframes _ngcontent-ng-c2020179949_login-aurore {
  0% {
    background-position:
      0% 0%,
      100% 0%,
      100% 100%,
      0% 100%;
    filter: hue-rotate(0deg) saturate(1);
  }
  50% {
    background-position:
      60% 40%,
      40% 60%,
      30% 70%,
      70% 30%;
    filter: hue-rotate(70deg) saturate(1.4);
  }
  100% {
    background-position:
      100% 100%,
      0% 100%,
      0% 0%,
      100% 0%;
    filter: hue-rotate(160deg) saturate(1.8);
  }
}
@keyframes _ngcontent-ng-c2020179949_login-orbes-rotation {
  to {
    transform: rotate(360deg);
  }
}
@keyframes _ngcontent-ng-c2020179949_login-orbes-pulse {
  from {
    opacity: 0.55;
    scale: 0.9;
  }
  to {
    opacity: 1;
    scale: 1.25;
  }
}
.login-card[_ngcontent-ng-c2020179949] {
  position: relative;
  z-index: 1;
  overflow: hidden;
  width: min(440px, 100%);
  padding: 2rem 2rem 1.5rem;
  box-shadow: var(--du-shadow-md);
  border-top: 4px solid var(--du-primary);
  animation: _ngcontent-ng-c2020179949_login-entree 1.1s cubic-bezier(0.2, 0.9, 0.3, 1.25) both, _ngcontent-ng-c2020179949_login-halo 3.5s ease-in-out 1.1s infinite alternate;
}
.login-card[_ngcontent-ng-c2020179949]::after {
  content: "";
  position: absolute;
  top: 0;
  left: -80%;
  width: 45%;
  height: 100%;
  pointer-events: none;
  background:
    linear-gradient(
      105deg,
      transparent,
      rgba(255, 255, 255, 0.55),
      transparent);
  transform: skewX(-18deg);
  animation: _ngcontent-ng-c2020179949_login-reflet 5s ease-in-out 1.5s infinite;
}
@keyframes _ngcontent-ng-c2020179949_login-entree {
  0% {
    opacity: 0;
    transform: perspective(900px) translateY(90px) rotateX(35deg) scale(0.7);
    filter: blur(14px);
  }
  60% {
    opacity: 1;
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: perspective(900px) translateY(0) rotateX(0) scale(1);
    filter: blur(0);
  }
}
@keyframes _ngcontent-ng-c2020179949_login-halo {
  0% {
    box-shadow:
      var(--du-shadow-md),
      0 0 25px 2px rgba(0, 200, 255, 0.45),
      0 0 70px 10px rgba(120, 80, 255, 0.25);
  }
  50% {
    box-shadow:
      var(--du-shadow-md),
      0 0 40px 6px rgba(255, 60, 160, 0.5),
      0 0 100px 18px rgba(0, 200, 255, 0.3);
  }
  100% {
    box-shadow:
      var(--du-shadow-md),
      0 0 30px 4px rgba(255, 220, 90, 0.45),
      0 0 90px 14px rgba(255, 60, 160, 0.28);
  }
}
@keyframes _ngcontent-ng-c2020179949_login-reflet {
  0% {
    left: -80%;
  }
  45%, 100% {
    left: 140%;
  }
}
.login-card[_ngcontent-ng-c2020179949]   img[_ngcontent-ng-c2020179949] {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.25));
  flex-shrink: 0;
  padding: 6px;
  border-radius: 14px;
  color: var(--du-primary);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.22);
}
.login-card__brand[_ngcontent-ng-c2020179949] {
  text-align: center;
  margin-bottom: 1.5rem;
}
.login-card__logo[_ngcontent-ng-c2020179949], 
.login-card__brand[_ngcontent-ng-c2020179949]   img[_ngcontent-ng-c2020179949] {
  display: inline-grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  color: #fff;
  margin-bottom: 0.9rem;
  box-shadow: var(--du-shadow-md);
  will-change: transform;
  animation: login-logo-flotte 3s ease-in-out infinite, login-logo-pulse 2s ease-in-out infinite;
}
.login-card[_ngcontent-ng-c2020179949]   du-logo[_ngcontent-ng-c2020179949] {
  display: inline-block;
  animation: login-logo-flotte 3s ease-in-out infinite;
}
.login-card__entite[_ngcontent-ng-c2020179949] {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--du-muted);
  animation: _ngcontent-ng-c2020179949_login-apparition 0.8s ease-out 0.5s both;
}
.login-card__brand[_ngcontent-ng-c2020179949]   h1[_ngcontent-ng-c2020179949] {
  margin-top: 0.3rem;
  font-size: 1.4rem;
  background:
    linear-gradient(
      90deg,
      var(--du-primary),
      #00c8ff,
      #ff3ca0,
      #ffdc5a,
      var(--du-primary));
  background-size: 300% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
  animation: _ngcontent-ng-c2020179949_login-apparition 0.8s ease-out 0.65s both, _ngcontent-ng-c2020179949_login-titre 6s linear infinite;
}
@keyframes _ngcontent-ng-c2020179949_login-titre {
  to {
    background-position: 300% 0;
  }
}
.login-card__brand[_ngcontent-ng-c2020179949]   .muted[_ngcontent-ng-c2020179949] {
  margin: 0.4rem 0 0;
  font-size: 0.9rem;
  animation: _ngcontent-ng-c2020179949_login-apparition 0.8s ease-out 0.8s both;
}
form[_ngcontent-ng-c2020179949] {
  display: grid;
  gap: 1rem;
}
form[_ngcontent-ng-c2020179949]    > *[_ngcontent-ng-c2020179949] {
  animation: _ngcontent-ng-c2020179949_login-apparition 0.7s cubic-bezier(0.2, 0.9, 0.3, 1.2) both;
}
form[_ngcontent-ng-c2020179949]    > *[_ngcontent-ng-c2020179949]:nth-child(1) {
  animation-delay: 0.9s;
}
form[_ngcontent-ng-c2020179949]    > *[_ngcontent-ng-c2020179949]:nth-child(2) {
  animation-delay: 1.05s;
}
form[_ngcontent-ng-c2020179949]    > *[_ngcontent-ng-c2020179949]:nth-child(3) {
  animation-delay: 1.2s;
}
form[_ngcontent-ng-c2020179949]    > *[_ngcontent-ng-c2020179949]:nth-child(4) {
  animation-delay: 1.35s;
}
form[_ngcontent-ng-c2020179949]    > *[_ngcontent-ng-c2020179949]:nth-child(5) {
  animation-delay: 1.5s;
}
@keyframes _ngcontent-ng-c2020179949_login-apparition {
  from {
    opacity: 0;
    transform: translateY(28px) scale(0.94);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.login-card__erreur[_ngcontent-ng-c2020179949] {
  margin: 0;
  padding: 0.65rem 0.85rem;
  border-radius: var(--du-radius);
  background: var(--du-danger-soft);
  border: 1px solid #f3c1c1;
  color: var(--du-danger);
  font-size: 0.87rem;
  font-weight: 500;
  animation: _ngcontent-ng-c2020179949_login-secousse 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}
@keyframes _ngcontent-ng-c2020179949_login-secousse {
  10%, 90% {
    transform: translateX(-2px);
  }
  20%, 80% {
    transform: translateX(5px);
  }
  30%, 50%, 70% {
    transform: translateX(-9px);
  }
  40%, 60% {
    transform: translateX(9px);
  }
}
.login-card__champ[_ngcontent-ng-c2020179949] {
  position: relative;
  display: flex;
  align-items: center;
  color: var(--du-muted);
}
.login-card__champ[_ngcontent-ng-c2020179949]    > du-icon[_ngcontent-ng-c2020179949] {
  position: absolute;
  left: 0.75rem;
  pointer-events: none;
  display: inline-flex;
  transition: transform 0.3s ease, color 0.3s ease;
}
.login-card__champ[_ngcontent-ng-c2020179949]:focus-within    > du-icon[_ngcontent-ng-c2020179949] {
  color: var(--du-primary);
  transform: scale(1.3) rotate(-8deg);
}
.login-card__champ[_ngcontent-ng-c2020179949]   .input[_ngcontent-ng-c2020179949] {
  padding-left: 2.5rem;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.login-card__champ[_ngcontent-ng-c2020179949]   .input[_ngcontent-ng-c2020179949]:focus {
  transform: translateY(-2px);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--du-primary) 30%, transparent), 0 8px 20px rgba(0, 200, 255, 0.25);
}
.login-card__champ[_ngcontent-ng-c2020179949]   .input[type=password][_ngcontent-ng-c2020179949], 
.login-card__champ[_ngcontent-ng-c2020179949]   .input[type=text][_ngcontent-ng-c2020179949] {
  padding-right: 2.75rem;
}
.login-card__oeil[_ngcontent-ng-c2020179949] {
  position: absolute;
  right: 0.4rem;
  display: inline-grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--du-muted);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}
.login-card__oeil[_ngcontent-ng-c2020179949]:hover {
  background: var(--du-primary-soft);
  color: var(--du-primary);
  transform: scale(1.2) rotate(10deg);
}
.login-card__options[_ngcontent-ng-c2020179949] {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.login-card__memo[_ngcontent-ng-c2020179949] {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.87rem;
  color: var(--du-text);
  cursor: pointer;
}
.login-card__memo[_ngcontent-ng-c2020179949]   input[_ngcontent-ng-c2020179949] {
  width: 1rem;
  height: 1rem;
  accent-color: var(--du-primary);
}
.login-card__submit[_ngcontent-ng-c2020179949] {
  position: relative;
  overflow: hidden;
  width: 100%;
  padding: 0.7rem 1rem;
  font-size: 0.95rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: _ngcontent-ng-c2020179949_login-bouton-pulse 2.4s ease-in-out 2s infinite;
}
.login-card__submit[_ngcontent-ng-c2020179949]::after {
  content: "";
  position: absolute;
  top: 0;
  left: -60%;
  width: 40%;
  height: 100%;
  pointer-events: none;
  background:
    linear-gradient(
      105deg,
      transparent,
      rgba(255, 255, 255, 0.6),
      transparent);
  transform: skewX(-20deg);
  animation: _ngcontent-ng-c2020179949_login-reflet 2.8s ease-in-out infinite;
}
.login-card__submit[_ngcontent-ng-c2020179949]:hover:not(:disabled) {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 12px 28px rgba(0, 200, 255, 0.45);
}
.login-card__submit[_ngcontent-ng-c2020179949]:active:not(:disabled) {
  transform: translateY(0) scale(0.97);
}
@keyframes _ngcontent-ng-c2020179949_login-bouton-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--du-primary) 55%, transparent);
  }
  50% {
    box-shadow: 0 0 0 14px color-mix(in srgb, var(--du-primary) 0%, transparent);
  }
}
.login-card__pied[_ngcontent-ng-c2020179949] {
  margin: 1.25rem 0 0;
  text-align: center;
  animation: _ngcontent-ng-c2020179949_login-apparition 0.8s ease-out 1.7s both;
}
@media (max-width: 520px) {
  .login-page[_ngcontent-ng-c2020179949] {
    padding: 1rem 0.75rem;
  }
  .login-card[_ngcontent-ng-c2020179949] {
    padding: 1.5rem 1.25rem 1.25rem;
  }
}
@media (prefers-reduced-motion: reduce) {
  .login-page[_ngcontent-ng-c2020179949]::before, 
   .login-page[_ngcontent-ng-c2020179949]::after, 
   .login-card[_ngcontent-ng-c2020179949], 
   .login-card[_ngcontent-ng-c2020179949]::after, 
   .login-card__logo[_ngcontent-ng-c2020179949], 
   .login-card__entite[_ngcontent-ng-c2020179949], 
   .login-card__brand[_ngcontent-ng-c2020179949]   h1[_ngcontent-ng-c2020179949], 
   .login-card__brand[_ngcontent-ng-c2020179949]   .muted[_ngcontent-ng-c2020179949], 
   form[_ngcontent-ng-c2020179949]    > *[_ngcontent-ng-c2020179949], 
   .login-card__erreur[_ngcontent-ng-c2020179949], 
   .login-card__submit[_ngcontent-ng-c2020179949], 
   .login-card__submit[_ngcontent-ng-c2020179949]::after, 
   .login-card__pied[_ngcontent-ng-c2020179949] {
    animation: none;
  }
}
/*# sourceMappingURL=/login.component.css.map */</style><style ng-app-id="ng">
[_nghost-ng-c1855657540] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
/*# sourceMappingURL=/icon.component.css.map */</style></head>
<body><!--nghm--><script type="text/javascript" id="ng-event-dispatch-contract">(()=>{function p(t,n,r,o,e,i,f,m){return{eventType:t,event:n,targetElement:r,eic:o,timeStamp:e,eia:i,eirp:f,eiack:m}}function u(t){let n=[],r=e=>{n.push(e)};return{c:t,q:n,et:[],etc:[],d:r,h:e=>{r(p(e.type,e,e.target,t,Date.now()))}}}function s(t,n,r){for(let o=0;o<n.length;o++){let e=n[o];(r?t.etc:t.et).push(e),t.c.addEventListener(e,t.h,r)}}function c(t,n,r,o,e=window){let i=u(t);e._ejsas||(e._ejsas={}),e._ejsas[n]=i,s(i,r),s(i,o,!0)}window.__jsaction_bootstrap=c;})();
</script><script>window.__jsaction_bootstrap(document.body,"ng",["submit","input","compositionstart","compositionend","click","change"],["blur"]);</script>
  <app-root ng-version="22.2.1" _nghost-ng-c3984273398="" ngh="2" ng-server-context="ssg"><router-outlet _ngcontent-ng-c3984273398=""></router-outlet><du-login _nghost-ng-c2020179949="" ngh="1"><main _ngcontent-ng-c2020179949="" class="login-page"><section _ngcontent-ng-c2020179949="" aria-labelledby="titre-connexion" class="login-card card"><div _ngcontent-ng-c2020179949="" class="login-card__brand"><span _ngcontent-ng-c2020179949="" aria-hidden="true" class="login-card__logo"><img _ngcontent-ng-c2020179949="" src="images/logo_CUA.svg" alt=""></span><p _ngcontent-ng-c2020179949="" class="login-card__entite">Direction de l’Urbanisme</p><h1 _ngcontent-ng-c2020179949="" id="titre-connexion">Espace d’administration</h1><p _ngcontent-ng-c2020179949="" class="muted">Connectez-vous pour accéder à la gestion des dossiers.</p></div><form _ngcontent-ng-c2020179949="" novalidate="" class="ng-untouched ng-pristine ng-invalid" jsaction="submit:;"><!--container--><div _ngcontent-ng-c2020179949="" class="field"><label _ngcontent-ng-c2020179949="" for="email">Adresse e-mail</label><div _ngcontent-ng-c2020179949="" class="login-card__champ"><du-icon _ngcontent-ng-c2020179949="" name="mail" _nghost-ng-c1855657540="" ngh="0"><svg _ngcontent-ng-c1855657540="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="18" height="18"><path _ngcontent-ng-c1855657540="" d="M4 6h16a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1zm1 2l7 5 7-5"></path></svg></du-icon><input _ngcontent-ng-c2020179949="" id="email" type="email" formcontrolname="email" placeholder="nom@du.gouv" autocomplete="username" inputmode="email" aria-describedby="erreur-email" class="input ng-untouched ng-pristine ng-invalid" aria-invalid="false" value="" jsaction="input:;blur:;compositionstart:;compositionend:;"></div><!--container--></div><div _ngcontent-ng-c2020179949="" class="field"><label _ngcontent-ng-c2020179949="" for="mot-de-passe">Mot de passe</label><div _ngcontent-ng-c2020179949="" class="login-card__champ"><du-icon _ngcontent-ng-c2020179949="" name="lock" _nghost-ng-c1855657540="" ngh="0"><svg _ngcontent-ng-c1855657540="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="18" height="18"><path _ngcontent-ng-c1855657540="" d="M6 11V8a6 6 0 0112 0v3M5 11h14a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1v-8a1 1 0 011-1zm3 0V8a3 3 0 016 0v3"></path></svg></du-icon><input _ngcontent-ng-c2020179949="" id="mot-de-passe" formcontrolname="motDePasse" placeholder="Votre mot de passe" autocomplete="current-password" aria-describedby="erreur-mot-de-passe" class="input ng-untouched ng-pristine ng-invalid" type="password" aria-invalid="false" value="" jsaction="input:;blur:;compositionstart:;compositionend:;"><button _ngcontent-ng-c2020179949="" type="button" class="login-card__oeil" aria-label="Afficher le mot de passe" aria-pressed="false" jsaction="click:;"><du-icon _ngcontent-ng-c2020179949="" _nghost-ng-c1855657540="" ngh="0"><svg _ngcontent-ng-c1855657540="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" width="18" height="18"><path _ngcontent-ng-c1855657540="" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zm10 3a3 3 0 110-6 3 3 0 010 6z"></path></svg></du-icon></button></div><!--container--></div><div _ngcontent-ng-c2020179949="" class="login-card__options"><label _ngcontent-ng-c2020179949="" class="login-card__memo"><input _ngcontent-ng-c2020179949="" type="checkbox" formcontrolname="memoriser" class="ng-untouched ng-pristine ng-valid" jsaction="change:;blur:;"> Rester connecté </label></div><button _ngcontent-ng-c2020179949="" type="submit" class="btn btn--primary login-card__submit"><!--container--> Se connecter <!--container--></button><span _ngcontent-ng-c2020179949="" role="status" class="sr-only"><!--ngetn--></span></form><p _ngcontent-ng-c2020179949="" class="login-card__pied muted small">Accès réservé aux agents habilités.</p></section></main></du-login><!--container--></app-root>
<link rel="modulepreload" href="chunk-75NUGXPU.js"><script src="main.js" type="module"></script>

<script id="ng-state" type="application/json">{"__nghData__":[{},{"t":{"12":"t0","19":"t1","28":"t2","34":"t3","35":"t4"},"c":{"12":[],"19":[],"28":[],"34":[],"35":[{"i":"t4","r":1}]}},{"c":{"0":[{"i":"c2020179949","r":1}]}}]}</script></body></html>`;