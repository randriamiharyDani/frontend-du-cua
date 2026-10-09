import { ServiceDossier } from './dossier.model';

/** Format d’affichage des dates proposé dans les préférences. */
export type FormatDate = 'dd/MM/yyyy' | 'dd-MM-yyyy' | 'yyyy-MM-dd';

/** Profil de l’utilisateur connecté (données de démonstration). */
export interface ProfilParametres {
  nom: string;
  email: string;
  service: ServiceDossier;
  fonction: string;
  telephone: string;
}

/** Préférences d’affichage de l’espace administrateur. */
export interface PreferencesParametres {
  langue: 'fr';
  formatDate: FormatDate;
  elementsParPage: number;
  afficherPriorites: boolean;
  notificationsEmail: boolean;
}

/** Informations générales de l’application. */
export interface ApplicationParametres {
  nomApplication: string;
  entite: string;
  sigle: string;
  emailContact: string;
  telephoneContact: string;
  adresse: string;
}

/** Service disponible dans l’application (DU, DIS, SCAD). */
export interface ServiceParametre {
  code: ServiceDossier;
  libelle: string;
  description: string;
  actif: boolean;
}

/** Ensemble des paramètres conservés localement (stockage navigateur). */
export interface Parametres {
  profil: ProfilParametres;
  preferences: PreferencesParametres;
  application: ApplicationParametres;
  services: ServiceParametre[];
}

/** Valeurs par défaut — servent aussi de base à la réinitialisation. */
export const PARAMETRES_DEFAUT: Parametres = {
  profil: {
    nom: 'Aminata Diallo',
    email: 'aminata.diallo@du.gouv',
    service: 'DU',
    fonction: 'Administratrice',
    telephone: '+224 34 00 000 00',
  },
  preferences: {
    langue: 'fr',
    formatDate: 'dd/MM/yyyy',
    elementsParPage: 8,
    afficherPriorites: true,
    notificationsEmail: false,
  },
  application: {
    nomApplication: 'Gestion des constructions illicites',
    entite: 'Direction de l’Urbanisme',
    sigle: 'DU',
    emailContact: 'contact@du.gouv',
    telephoneContact: '+224 20 00 000 00',
    adresse: 'Conakry — Guinée',
  },
  services: [
    {
      code: 'DU',
      libelle: 'Direction de l’Urbanisme',
      description: 'Instruction des dossiers, décisions et suivi des constructions illicites.',
      actif: true,
    },
    {
      code: 'DIS',
      libelle: 'Direction des Infrastructures Sociales',
      description: 'Équipements et infrastructures sociales rattachés aux dossiers.',
      actif: true,
    },
    {
      code: 'SCAD',
      libelle: 'Service du Cadastre',
      description: 'Références foncières, plan cadastral et parcelles.',
      actif: true,
    },
  ],
};

/** Clé de stockage local utilisée pour la démonstration. */
export const CLE_STOCKAGE_PARAMETRES = 'du.parametres.v1';

/** Copie indépendante des paramètres par défaut. */
export function parametresParDefaut(): Parametres {
  return JSON.parse(JSON.stringify(PARAMETRES_DEFAUT)) as Parametres;
}
