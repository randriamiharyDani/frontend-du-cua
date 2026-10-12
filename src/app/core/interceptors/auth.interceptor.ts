import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Ajoute le jeton Sanctum (Bearer) à chaque requête sortante et gère
 * l'expiration de session : sur `401`, la session locale est purgée et
 * l'utilisateur est renvoyé vers la page de connexion.
 */
export const authInterceptor: HttpInterceptorFn = (requete, suivant) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const jeton = auth.token();

  const requeteAuth = jeton
    ? requete.clone({ setHeaders: { Authorization: `Bearer ${jeton}` } })
    : requete;

  return suivant(requeteAuth).pipe(
    catchError((erreur: HttpErrorResponse) => {
      if (erreur.status === 401 && auth.estConnecte()) {
        auth.purger();
        void router.navigate(['/connexion']);
      }
      return throwError(() => erreur);
    }),
  );
};
