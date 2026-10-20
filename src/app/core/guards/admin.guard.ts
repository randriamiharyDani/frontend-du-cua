import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Restreint une route à l'administrateur système (`role === 'admin_systeme'`).
 *
 * `authGuard` vérifie déjà la connexion ; ce garde vérifie l'habilitation :
 * tout autre rôle est renvoyé vers le tableau de bord au lieu de subir un
 * `403` API (ex. page « Utilisateurs » réservée par `UserPolicy::viewAny`).
 */
export const adminSystemeGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.utilisateur()?.role === 'admin_systeme') {
    return true;
  }

  return router.createUrlTree(['/admin/dashboard']);
};
