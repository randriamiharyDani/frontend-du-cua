import { ServiceDossier } from './dossier.model';
import {
  ApplicationParametres,
  Parametres,
  PreferencesParametres,
  ProfilParametres,
  ReferentielsParametres,
} from './parametres.model';

/**
 * Contrats JSON de l'API paramètres du backend Laravel
 * (`ParametresController`). Chaque réponse encapsule l'état complet sous la
 * clé `parametres` ; les écritures ajoutent un `message` de confirmation.
 */

/** Réponse de `GET /parametres` et des écritures. */
export interface ReponseParametres {
  parametres: Parametres;
}

/** Réponse d'une écriture (avec message). */
export interface ReponseParametresMessage extends ReponseParametres {
  message: string;
}

/** Corps d'enregistrement du profil (raccordé à la table `users`). */
export type PayloadProfil = ProfilParametres;

/** Corps d'enregistrement des préférences d'affichage personnelles. */
export type PayloadPreferences = PreferencesParametres;

/** Corps d'enregistrement des informations globales de l'application. */
export type PayloadApplication = ApplicationParametres;

/** Corps d'activation / désactivation d'un service. */
export interface PayloadServiceParametre {
  code: ServiceDossier;
  actif: boolean;
}

/** Référentiels applicatifs retournés par l'API. */
export type PayloadReferentiels = ReferentielsParametres;
