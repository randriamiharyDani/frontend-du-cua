import { ServiceDossier } from './dossier.model';
import { EtatCompte, RoleUtilisateur } from './utilisateur.model';

/**
 * Contrats JSON de l'API utilisateurs du backend Laravel (`UserResource`).
 * Les noms de champs reproduisent ceux renvoyés par la ressource.
 */

/** Utilisateur renvoyé par `UserResource`. */
export interface UtilisateurDto {
  id: number;
  name: string;
  prenom: string | null;
  nom: string | null;
  email: string;
  service: ServiceDossier | null;
  role: RoleUtilisateur | null;
  role_label?: string | null;
  statut: EtatCompte | null;
  statut_label?: string | null;
  date_creation: string | null;
  created_at: string | null;
}

/** Filtres acceptés par `GET /users` (IndexUserRequest). */
export interface FiltresUtilisateurs {
  search?: string;
  service?: ServiceDossier | '';
  role?: RoleUtilisateur | '';
  statut?: EtatCompte | '';
  per_page?: number;
  page?: number;
}

/**
 * Corps d'écriture d'un utilisateur (`StoreUserRequest` / `UpdateUserRequest`).
 * Le mot de passe est obligatoire à la création, optionnel en modification.
 */
export interface PayloadUtilisateur {
  prenom: string;
  nom: string;
  email: string;
  password?: string;
  service: ServiceDossier;
  role: RoleUtilisateur;
  statut: EtatCompte;
}
