import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Protège l'espace `/admin` : redirige vers `/connexion` si aucun jeton
 * valide n'est présent (session restaurée depuis le stockage navigateur).
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.estConnecte()) {
    return true;
  }

  return router.createUrlTree(['/connexion']);
};
