/**
 * Navigation principale de l'espace administrateur DU.
 * Données d'affichage temporaires — aucun appel API.
 */

export interface AdminNavItem {
  path: string;
  label: string;
  description: string;
  icon: string;
  /** Active uniquement sur correspondance exacte (ex. Tableau de bord). */
  exact?: boolean;
}

export interface AdminUser {
  nom: string;
  service: string;
  role: string;
  initiales: string;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { path: '/admin/dashboard', label: 'Tableau de bord', description: 'Vue d’ensemble de l’activité', icon: 'dashboard', exact: true },
  { path: '/admin/dossiers', label: 'Dossiers', description: 'Constructions illicites suivies', icon: 'folder' },
  { path: '/admin/mouvements', label: 'Mouvements', description: 'Entrées, sorties et transferts', icon: 'swap' },
  { path: '/admin/localisations', label: 'Localisations', description: 'Quartiers et arrondissements', icon: 'pin' },
  { path: '/admin/documents', label: 'Documents', description: 'Pièces jointes des dossiers', icon: 'file' },
  { path: '/admin/utilisateurs', label: 'Utilisateurs', description: 'Agents et habilitations', icon: 'users' },
  { path: '/admin/canevas-excel', label: 'Canevas Excel', description: 'Modèles d’import et d’export', icon: 'sheet' },
  { path: '/admin/parametres', label: 'Paramètres', description: 'Configuration de l’espace', icon: 'gear' },
];

/** Utilisateur fictif affiché dans la barre supérieure. */
export const ADMIN_CURRENT_USER: AdminUser = {
  nom: 'Aminata Diallo',
  service: 'Service du Contrôle Urbain',
  role: 'Administratrice',
  initiales: 'AD',
};
