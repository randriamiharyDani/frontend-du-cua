import { ServiceDossier } from './dossier.model';

/** Rôles de démonstration dans l’espace administrateur. */
export type RoleUtilisateur = 'admin_systeme' | 'administrateur' | 'agent';

export const ROLE_UTILISATEUR_LABEL: Record<RoleUtilisateur, string> = {
  admin_systeme: 'Administrateur système',
  administrateur: 'Administrateur',
  agent: 'Agent',
};

export const ROLES_UTILISATEUR: readonly RoleUtilisateur[] = [
  'admin_systeme',
  'administrateur',
  'agent',
];

/** État du compte utilisateur. */
export type EtatCompte = 'actif' | 'inactif' | 'suspendu';

export const ETAT_COMPTE_LABEL: Record<EtatCompte, string> = {
  actif: 'Actif',
  inactif: 'Inactif',
  suspendu: 'Suspendu',
};

export const ETATS_COMPTE: readonly EtatCompte[] = ['actif', 'inactif', 'suspendu'];

/** Utilisateur de l’espace administrateur (données locales de démonstration). */
export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  service: ServiceDossier;
  role: RoleUtilisateur;
  etat: EtatCompte;
  dateCreation: string;
}

/** Valeur du formulaire d’ajout / modification d’un utilisateur. */
export type UtilisateurFormValue = Omit<Utilisateur, 'id' | 'dateCreation'>;

/** Nom complet affiché dans les listes. */
export const nomComplet = (u: Pick<Utilisateur, 'prenom' | 'nom'>) =>
  `${u.prenom} ${u.nom}`.trim();
